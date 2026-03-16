<script lang="ts">
  import type { AcademicYear, Cell, Degree, School, Year } from '$lib/server/kairos';
  import { Calendar, ChevronRight, MapPin, User } from '@lucide/svelte';
  import type { Action } from 'svelte/action';
  import { addDays, format } from 'date-fns';
  import { it } from 'date-fns/locale';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { twMerge } from 'tailwind-merge';
  import { flip } from 'svelte/animate';
  import { quintOut } from 'svelte/easing';

  type Props = {
    acYear: AcademicYear;
    school: School;
    degree: Degree;
    year: Year;
    date: Date;
    schedule: Cell[];
  };

  const { acYear, school, degree, year, schedule, date }: Props = $props();

  // let selectedDate = $state(new Date());
  let weekDays = $derived(() =>
    Array.from({ length: 15 }).map((_, i) => addDays(date, i - 7))
  );

  const backToWizard = () => {
    const segmentsWithoutLast = page.url.pathname.split('/').slice(0, -1);

    goto(resolve(`/${segmentsWithoutLast.join('/')}`), {
      keepFocus: true
    });
  };

  const setDate = (newDate: Date) => {
    // selectedDate = newDate;
    const url = new URL(page.url);
    url.searchParams.set('date', format(newDate, 'yyyy-MM-dd'));

    goto(url, {
      keepFocus: true
    });
  };

  const centerScroll: Action<HTMLElement, unknown> = (node) => {
    const scrollToCenter = () => {
      const maxScrollLeft = node.scrollWidth - node.clientWidth;

      node.scrollTo({
        left: maxScrollLeft / 2,
        behavior: 'smooth'
      });
    };

    scrollToCenter();

    return {
      update() {
        scrollToCenter();
      }
    };
  };
</script>

<div class="min-h-dvh bg-neutral-100">
  <div class="flex flex-wrap items-center gap-1.5 bg-indigo-600 p-4 font-bold text-white">
    <Calendar class="h-8 w-8 rounded-xl bg-white/20 p-1.5" />
    <p>Kronos</p>
    <button
      class="mt-2 flex w-full items-center gap-1.5 rounded-xl border border-white/10 bg-white/20 p-2 text-left text-xs transition-opacity active:opacity-70"
      onclick={backToWizard}
    >
      <div>
        <p class="mb-1 w-full capitalize">{degree.label}</p>
        <p class="font-normal">{`${school.label} • ${year.label}`}</p>
      </div>
      <ChevronRight class="h-full shrink-0" />
    </button>
  </div>
  <div class="flex flex-wrap gap-4 bg-white p-4 text-sm shadow-sm">
    <p class="font-bold capitalize">{format(new Date(), 'MMMM yyyy', { locale: it })}</p>
    <button
      class="ml-auto rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-600 transition-opacity active:opacity-70"
      onclick={() => setDate(new Date())}
    >
      {`Oggi: ${format(new Date(), 'd MMM', { locale: it })}`}
    </button>
    <div
      class="flex w-full gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      use:centerScroll={date}
    >
      {#each weekDays() as day (day.getTime())}
        {@const isSelected = date.getTime() === day.getTime()}
        <button
          class={twMerge(
            'flex flex-col items-center gap-0.5 rounded-xl border border-neutral-200 px-4 py-2 transition-colors active:bg-neutral-200',
            isSelected ? 'active bg-indigo-600 text-white shadow-sm' : ''
          )}
          onclick={() => setDate(day)}
          animate:flip={{ duration: 400, easing: quintOut }}
        >
          <span
            class={twMerge(
              'text-xs font-bold text-neutral-500 uppercase',
              isSelected ? 'text-neutral-300' : ''
            )}>{format(day, 'EEE', { locale: it })}</span
          >
          <span class="text-center text-xl font-bold">{format(day, 'd')}</span>
        </button>
      {/each}
    </div>
  </div>
  <div>
    {#if schedule.length === 0}
      <div>
        <div class="mx-auto mt-12 mb-3 w-min rounded-full bg-white p-3">
          <Calendar class="mx-auto h-8 w-8 text-neutral-300" />
        </div>
        <h3 class="mb-2 text-center text-xl font-bold">Non ci sono lezioni</h3>
        <p class="text-center text-sm text-neutral-500">
          Hai il giorno libero {format(date, 'EEEE', { locale: it })}!
        </p>
      </div>
    {:else}
      {#each schedule as lesson, index (index)}
        {@const isCancelled = lesson.Annullato === "1"}
        {@const bgColor = isCancelled ? 'bg-red-600' : 'bg-indigo-500'}
        {@const textColor = isCancelled ? 'text-red-600' : 'text-indigo-500'}
        <div class="relative m-4 overflow-hidden rounded-xl bg-white px-4 py-2 shadow-sm">
          <div class="absolute top-0 bottom-0 left-0 w-1.5 {bgColor}"></div>
          <span
            class="absolute top-2 right-2 rounded-full bg-neutral-100 px-2 py-1 text-xs font-bold text-neutral-600 uppercase"
            >{lesson.tipo}</span
          >

          <p class="text-sm font-bold {textColor}">{lesson.orario}</p>
          <p class="mb-8 font-bold capitalize {isCancelled ? 'line-through italic': ''}">{lesson.titolo_lezione}</p>
          <div class="mb-2 flex items-center gap-1.5">
            <MapPin class="h-4 w-4 text-neutral-400" />
            <span class="text-sm text-neutral-600">{lesson.aula}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <User class="h-4 w-4 text-neutral-400" />
            <span class="text-sm text-neutral-600 capitalize">{lesson.docente}</span>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>
