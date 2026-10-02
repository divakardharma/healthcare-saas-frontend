import defaultTheme from "./defaultTheme";

function createTenantTheme(tenant) {
  return {
    ...defaultTheme,
    ...tenant?.theme,
    colors: {
      ...defaultTheme.colors,
      ...tenant?.theme?.colors,
    },
  };
}

export default createTenantTheme;