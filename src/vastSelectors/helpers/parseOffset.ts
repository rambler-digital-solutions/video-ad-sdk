import parseTime from './parseTime';

const isPercentage = (offset: string): boolean => {
  const percentageRegex = /^\d+(\.\d+)?%$/g;

  return percentageRegex.test(offset);
};

const parseOffset = (offset: string): string | number | null => {
  if (isPercentage(offset)) {
    return offset;
  }

  return parseTime(offset);
};

export default parseOffset;
