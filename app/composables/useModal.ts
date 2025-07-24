const visibleModal = ref<string | null>("");
const propsModal = ref<unknown>();

function toggleModal(
  state: string | null = null,
  meta: unknown | null = null
): void {
  visibleModal.value = state;

  propsModal.value = meta;
}

export { visibleModal, propsModal, toggleModal };
