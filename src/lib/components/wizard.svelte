<script lang="ts">
  import WizardStep from '$lib/components/wizard-step.svelte';
  import { ChevronLeft, type Icon as IconType } from '@lucide/svelte';
  import { fly } from 'svelte/transition';
  import { twMerge } from 'tailwind-merge';
  import { goto, onNavigate } from '$app/navigation';
  import { page } from '$app/state';
  import { resolve } from '$app/paths';

  type Props = {
    title: string;
    subtitle: string;
    options: { label: string; value: string, tags?: string[] }[];
    step: number;
    stepCount: number;
    icon: typeof IconType;
    onSelect: (a: string) => void;
  };

  const { title, subtitle, options, step, stepCount, icon: Icon, onSelect }: Props = $props();

  // We purposefully want the initial state
  let previousStep = $state(step);
  let direction = $state(0);
  let swipeDuration = $state(300);

  // Calculate animation direction
  $effect.pre(() => {
    if (step !== previousStep) {
      if (step === undefined || previousStep === undefined) {
        direction = 1;
      } else {
        direction = step > previousStep ? 1 : -1;
      }

      previousStep = step;
    }
  });

  onNavigate((navigation) => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (navigation.type === 'popstate' && isIOS) {
      swipeDuration = 0;
    } else {
      swipeDuration = 300;
    }
  });

  const gotoPrevStep = () => {
    const parentPath = page.url.pathname.slice(0, page.url.pathname.lastIndexOf('/')) || '/';

    goto(resolve(`/${parentPath}`), {
      keepFocus: true
    });
  };
</script>

<div>
  <div
    class="fixed z-50 flex h-12 w-screen items-center justify-center gap-1.5 border-b border-gray-300 bg-white"
  >
    {#if step}
      <button
        class="absolute left-3 rounded-full p-1 transition-colors active:bg-neutral-200"
        onclick={gotoPrevStep}
      >
        <ChevronLeft />
      </button>
    {/if}
    {#each { length: stepCount }, index}
      <div
        class={twMerge(
          'h-2 w-2 rounded-full bg-neutral-200 transition-all duration-300',
          step === index ? 'w-4 bg-indigo-600' : ''
        )}
      ></div>
    {/each}
  </div>
  <div class="z-0 grid grid-cols-1 grid-rows-1">
    {#key step}
      <div
        class="col-start-1 row-start-1"
        in:fly|global={{ x: direction * 100, duration: swipeDuration }}
        out:fly|global={{ x: direction * -100, duration: swipeDuration }}
      >
        <WizardStep {title} {subtitle} {options} icon={Icon} {onSelect} />
      </div>
    {/key}
  </div>
</div>
