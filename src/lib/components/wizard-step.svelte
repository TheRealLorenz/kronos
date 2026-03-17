<script lang="ts">
  import { Check, type Icon as IconType } from '@lucide/svelte';
  import { writable } from 'svelte/store';
  import { twMerge } from 'tailwind-merge';

  type Props = {
    title: string;
    subtitle: string;
    options: { label: string; value: string; tags?: string[] }[];
    icon: typeof IconType;
    onSelect: (a: string) => void;
  };

  const {
    title,
    subtitle,
    options,
    icon: Icon,
    onSelect
  }: Props = $props();

  const selected = writable<string | undefined>(undefined);
</script>

<div class="bg-gray-100">
  <div class="flex min-h-dvh flex-col items-center max-w-180 mx-auto p-4 pt-16">
    <Icon class="mt-4 h-16 w-16 rounded-2xl bg-indigo-100 p-4 text-indigo-600" />
    <h1 class="m-4 text-4xl font-bold">{title}</h1>
    <p class="text-sm text-neutral-500">{subtitle}</p>

      {#if options.length > 0}
        <div class="mt-8 w-full">
          {#each options as option (option.value)}
            <button
              onclick={() => {
                selected.set(option.value);

                setTimeout(() => {
                  onSelect($selected || "");
                }, 200);
              }}
              class={twMerge(
                "my-2 w-full rounded-xl border border-neutral-300 bg-white p-3 text-left text-sm font-bold transition-all active:scale-[0.98]",
                $selected === option.value ? 'border-indigo-600 bg-indigo-50/50 shadow-sm text-indigo-500' : ''
              )}
            >
              <div class="flex items-center">
                <div>
                  <p class="capitalize text-md">{option.label}</p>
                  {#if option?.tags?.length}
                    <div class="mt-2">
                      {#each option.tags as tag (tag)}
                        <span class="uppercase text-xs bg-indigo-100 text-indigo-600 py-0.5 px-2 rounded-full">{tag}</span>
                      {/each}
                    </div>
                  {/if}
                </div>
                {#if $selected === option.value}
                  <Check class="w-6 h-6 ml-auto text-white bg-indigo-600 rounded-full shrink-0" />
                {/if}
              </div>
            </button>
          {/each}
        </div>
      {:else}
        <div class="flex grow justify-center items-center">
          <p class="text-neutral-500">Sembra non ci siano opzioni!</p>
        </div>
      {/if}
  </div>
</div>
