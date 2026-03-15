<script lang="ts">
  import { BookOpen, Building, GraduationCap } from '@lucide/svelte';
  import type { PageProps } from './$types';
  import Wizard from '$lib/components/wizard.svelte';
  import { resolve } from '$app/paths';
  import { page } from "$app/state";
  import { goto } from '$app/navigation';
  import Timetable from '$lib/components/timetable.svelte';

  const { data }: PageProps = $props();

  const STEPS = [
    {
      icon: Building,
      title: 'Che scuola?',
      subtitle: 'Scegli la scuola'
    },
    {
      icon: GraduationCap,
      title: 'Che laurea?',
      subtitle: 'Scegli la laurea'
    },
    {
      icon: BookOpen,
      title: 'Che anno?',
      subtitle: 'Scegli l\'anno',
    }
  ];

</script>

{#if data.step !== undefined }
  <Wizard
    title={STEPS[data.step].title}
    subtitle={STEPS[data.step].subtitle}
    step={data.step}
    icon={STEPS[data.step].icon}
    stepCount={STEPS.length}
    options={data.options}
    onSelect={(value) => {
      goto(resolve(`/${page.url.pathname}/${value}`), {
        keepFocus: true,
      })
    }}
  />
{:else}
  <Timetable
    acYear={data.selected.acYear}
    school={data.selected.school}
    degree={data.selected.degree}
    year={data.selected.year}
    date={data.selected.date}
    schedule={data.schedule}
  />
{/if}
