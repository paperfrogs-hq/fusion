type ErrorRecord = Record<string, unknown>;

const asErrorRecord = (error: unknown): ErrorRecord | null => {
  if (typeof error === "object" && error !== null) {
    return error as ErrorRecord;
  }

  return null;
};

export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  const record = asErrorRecord(error);
  if (record && typeof record.message === "string" && record.message.length > 0) {
    return record.message;
  }

  return fallback;
};

export const getErrorMetadata = (error: unknown) => {
  const record = asErrorRecord(error);

  return {
    details: record?.details,
    hint: record?.hint,
    code: record?.code,
  };
};
