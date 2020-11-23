const disp = (vm, str, pro = null) => {
  return vm.$store.dispatch(str, pro);
};

export default disp;
