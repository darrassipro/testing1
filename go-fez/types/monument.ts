type Monument = {
  id: number;
  latitude: number;
  longitude: number;
  title: string;
  type: string;
  imageUrl?: string;
  order?: number;
  isCompleted?: boolean;
  isCurrent?: boolean;
};
export default Monument;
