export default (access) => {
  return {
    authority: access?.authority?.[0] || 0,
  };
};
