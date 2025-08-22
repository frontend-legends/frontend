export default function () {
  const scrollY = ref(0);

  const { height: windowHeight } = useWindowSize();

  const updateScroll = () => {
    scrollY.value = window.scrollY;
  };

  const debouncedUpdateScroll = useDebounceFn(updateScroll, 5);

  const scrollProgress = computed(() => {
    const documentHeight = document.documentElement.scrollHeight;
    const scrollableHeight = documentHeight - windowHeight.value;

    const value =
      Number((scrollY.value / scrollableHeight) * 100) > 100
        ? 100
        : Number((scrollY.value / scrollableHeight) * 100);

    return value;
  });

  onMounted(() => {
    window.addEventListener("scroll", debouncedUpdateScroll);
    debouncedUpdateScroll();
  });

  onUnmounted(() => {
    window.removeEventListener("scroll", debouncedUpdateScroll);
  });

  return { scrollProgress };
}
