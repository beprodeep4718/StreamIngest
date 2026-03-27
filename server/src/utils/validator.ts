export const validateRow = (row: Record<string, string>) => {

  if (!row.name) {
    return "Missing name";
  }

  if (!row.email) {
    return "Missing email";
  }

  return null;
};