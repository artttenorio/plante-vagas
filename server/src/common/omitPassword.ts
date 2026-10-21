export function omitPassword<T extends { password?: unknown }>(entity: T): Omit<T, 'password'> {
  const { password, ...rest } = entity;
  return rest;
}
