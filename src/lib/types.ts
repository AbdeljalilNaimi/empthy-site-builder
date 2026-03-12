export interface ImportSource {
  id: string;
  name: string;
  type: 'csv' | 'api' | 'url' | 'file' | 'text';
  icon: string;
  description: string;
}
