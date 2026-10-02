import defaultTheme from "./defaultTheme";

function createTenantTheme(tenant) {
  const metadata = tenant?.metadata || {};

  return {
    ...defaultTheme,

    colors: {
      ...defaultTheme.colors,

      primary: metadata.primary_color || defaultTheme.colors.primary,

      primaryHover:
        metadata.primary_hover || defaultTheme.colors.primaryHover,
    },
  };
}

export default createTenantTheme;