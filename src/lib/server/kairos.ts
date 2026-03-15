import { dev } from '$app/environment';
import { format } from 'date-fns';

type LocalCacheItem = { data: unknown; expiry: number };

const localDevCache: Map<string, LocalCacheItem> =
  // Overriding globalThis strictly for Vite HMR persistence.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).__myBadApiCache ?? new Map<string, LocalCacheItem>();
if (dev) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).__myBadApiCache = localDevCache;
}

export type AcademicYear = {
  label: string;
  valore: string;
};

export type School = {
  label: string;
  valore: string;
  id: string;
};

export type Degree = {
  elenco_anni: Year[];
  label: string;
  tipo: string;
  valore: string;
  scuola: string;
};

export type Year = {
  label: string;
  valore: string;
};

export type Timetable = {
  celle: Cell[];
};

export type Cell = {
  titolo_lezione: string;
  docente: string;
  aula: string;
  orario: string;
  tipo: string;
  data: string;
};

async function loadAcademicYears(): Promise<AcademicYear[]> {
  const response = await fetch('https://kairos.unifi.it/agendaweb/combo.php?aa=1');

  const rawValue = await response.text();

  try {
    const rawJson = rawValue.slice('var anni_accademici_ec = '.length, -1);
    const rawObj = JSON.parse(rawJson);

    return Object.values(rawObj);
  } catch (e) {
    console.error(e);

    return [];
  }
}

async function loadSchoolsAndDegrees(year: string): Promise<string> {
  const url = `https://kairos.unifi.it/agendaweb/combo.php?aa=${year}&page=corsi`;

  if (dev) {
    const now = Date.now();

    if (localDevCache.has(url)) {
      const item = localDevCache.get(url)!;
      if (now < item.expiry) {
        console.log('Cache hit');
        return item.data as string;
      }
    }

    console.log('Cache miss');
    const response = await fetch(url);
    const data = await response.text();

    localDevCache.set(url, { data, expiry: now + 300 * 1000 });
    return data;
  }

  throw 'Not implemented!';
}

async function loadSchools(year: string): Promise<School[]> {
  const rawValue = await loadSchoolsAndDegrees(year);

  try {
    const lastLine = rawValue.split('\n').at(-3) ?? '';
    const rawJson = lastLine.slice('var elenco_scuole = '.length, -1);

    return JSON.parse(rawJson);
  } catch (e) {
    console.error(e);

    return [];
  }
}

async function loadDegrees(year: string, school: string): Promise<Degree[]> {
  const rawValue = await loadSchoolsAndDegrees(year);

  try {
    const firstLine = rawValue.split('\n')[0] ?? '';
    const rawJson = firstLine.slice('var elenco_corsi = '.length, -1);
    const rawObject: Degree[] = JSON.parse(rawJson);

    return (
      rawObject
        .filter((x) => x.scuola === school)
        // Restrict the amount of data sent to the client
        .map(({ label, tipo, valore, elenco_anni, scuola }) => ({
          label: label.toLowerCase(),
          tipo,
          valore,
          elenco_anni,
          scuola
        }))
    );
  } catch (e) {
    console.error(e);

    return [];
  }
}

async function loadTimetable(
  acYear: string,
  degree: string,
  year: string,
  date: Date
): Promise<Cell[]> {
  const formattedDate = format(date, 'dd-MM-yyyy');

  const formData = new FormData();

  formData.append('anno', acYear);
  formData.append('anno2[]', year);
  formData.append('corso', degree);
  formData.append('include', 'corso');
  formData.append('date', formattedDate);

  //formData.append('form-type', 'corso');
  //formData.append('txtcurr', '3+-+TECNICO+SCIENTIFICO');
  //formData.append('view', 'easycourse');
  //formData.append('scuola', 'ScuoladiIngegneria');
  //formData.append('periodo_didattico', '');
  //formData.append('_lang', 'it');
  //formData.append('list', '');
  //formData.append('week_grid_type', '-1');
  //formData.append('ar_codes_', '');
  //formData.append('ar_select_', '');
  //formData.append('col_cells', '0');
  //formData.append('empty_box', '0');
  //formData.append('only_grid', '0');
  //formData.append('highlighted_date', '0');
  //formData.append('all_events', '0');
  //formData.append('faculty_group', '0');
  //formData.append('_lang', 'it');
  //formData.append('all_events', '0');
  //formData.append('txtcurr', '3 - TECNICO SCIENTIFICO');

  const response = await fetch('https://kairos.unifi.it/agendaweb/grid_call.php', {
    body: formData,
    method: 'POST'
  });

  try {
    const rawObject: Timetable = JSON.parse(await response.text());
    const cells = rawObject.celle
      .filter((x) => x.data === formattedDate)
      .map(({ titolo_lezione, docente, aula, orario, tipo, data }) => ({
        titolo_lezione: titolo_lezione.toLowerCase(),
        docente: docente.toLowerCase(),
        aula,
        orario,
        tipo,
        data
      }))
      .sort((a, b) => a.orario.localeCompare(b.orario));
    return cells;
  } catch (e) {
    console.error(e);

    return [];
  }
}

export const Kairos = {
  loadAcademicYears,
  loadSchools,
  loadDegrees,
  loadTimetable
};
