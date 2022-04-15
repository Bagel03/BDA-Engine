let currentID = 0;
export const generateID = () => (++currentID).toString(36);
