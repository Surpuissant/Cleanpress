export type NormalizedRoute = {
  path: string;
  moduleName: string;
};

export function normalizeRoute(routeName: string): NormalizedRoute {
  const cleaned = routeName.trim().replace(/^\/+|\/+$/g, '');

  if (!cleaned) {
    throw new Error('Le nom de la route est obligatoire.');
  }

  const moduleName = cleaned
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9/-]/g, '-')
    .replace(/\//g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();

  return {
    path: `/${cleaned}`,
    moduleName,
  };
}

export function normalizeControllerName(controllerName: string): string {
  const pascalName = toPascalCase(controllerName);

  if (!pascalName) {
    throw new Error('Le nom du controller est obligatoire.');
  }

  return pascalName.endsWith('Controller') ? pascalName : `${pascalName}Controller`;
}

export function toPascalCase(value: string): string {
  return value
    .trim()
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

export function toCamelCase(value: string): string {
  const pascalName = toPascalCase(value);
  return pascalName.charAt(0).toLowerCase() + pascalName.slice(1);
}
