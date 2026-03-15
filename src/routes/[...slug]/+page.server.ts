import { resolve } from '$app/paths';
import {
  Kairos,
  type AcademicYear,
  type Cell,
  type Degree,
  type School,
  type Year
} from '$lib/server/kairos';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { format } from 'date-fns';

type PageData =
  | {
      step: number;
      options: { label: string; value: string }[];
    }
  | {
      step: undefined;
      selected: {
        acYear: AcademicYear;
        school: School;
        degree: Degree;
        year: Year;
        date: Date;
      };
      schedule: Cell[];
    };

export const load: PageServerLoad = async ({ params, url }): Promise<PageData> => {
  const selectedOptions = params.slug.split('/');
  const acYears = (await Kairos.loadAcademicYears()).sort((a, b) =>
    a.valore.localeCompare(b.valore)
  );

  // matches /
  if (selectedOptions.length === 1 && selectedOptions[0].length === 0) {
    const currentAcYear = acYears.at(-1);

    redirect(301, resolve(`/${currentAcYear?.valore}`));
  }

  const selectedAcYear = acYears.find((x) => x.valore === selectedOptions[0]);
  if (!selectedAcYear) {
    redirect(301, resolve('/'));
  }

  const schools = (await Kairos.loadSchools(selectedAcYear.valore)).sort((a, b) =>
    a.label.localeCompare(b.label)
  );

  // matches /{acYear} with valid data
  if (selectedOptions.length < 2) {
    return {
      step: 0,
      options: schools.map(({ label, valore }) => ({ label, value: valore }))
    };
  }

  const selectedSchool = schools.find((x) => x.valore === selectedOptions[1]);
  if (!selectedSchool) {
    redirect(301, resolve(`/${selectedAcYear.valore}`));
  }

  const degrees = (await Kairos.loadDegrees(selectedAcYear.valore, selectedSchool.valore)).sort(
    (a, b) => a.label.localeCompare(b.label)
  );

  // matches /{acYear}/{school}
  if (selectedOptions.length < 3) {
    return {
      step: 1,
      options: degrees.map(({ label, valore }) => ({ label, value: valore }))
    };
  }

  const selectedDegree = degrees.find((x) => x.valore === selectedOptions[2]);
  if (!selectedDegree) {
    redirect(301, resolve(`/${selectedAcYear.valore}/${selectedSchool.valore}`));
  }

  const years = selectedDegree.elenco_anni;

  // matches /{acYear}/{school}/{degree}
  if (selectedOptions.length < 4) {
    return {
      step: 2,
      options: years.map(({ label, valore }) => ({ label, value: valore }))
    };
  }

  const selectedYear = selectedDegree.elenco_anni.find((x) => x.valore === selectedOptions[3]);
  if (!selectedYear) {
    redirect(
      301,
      resolve(`/${selectedAcYear.valore}/${selectedSchool.valore}/${selectedDegree.valore}`)
    );
  }

  const selectedDate = url.searchParams.get('date');
  const parsedDate = Date.parse(selectedDate || '');

  if (isNaN(parsedDate)) {
    const newUrl = new URL(url);
    newUrl.searchParams.set('date', format(new Date(), 'yyyy-MM-dd'));

    redirect(301, newUrl);
  }

  const schedule = await Kairos.loadTimetable(
    selectedAcYear.valore,
    selectedDegree.valore,
    selectedYear.valore,
    new Date(parsedDate)
  );

  // We're done!
  return {
    step: undefined,
    selected: {
      acYear: selectedAcYear,
      school: selectedSchool,
      degree: selectedDegree,
      year: selectedYear,
      date: new Date(parsedDate)
    },
    schedule
  };
};
