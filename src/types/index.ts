export interface Employee {
  id: number;
  name: string;
  age: number;
  email: string;
  department: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Device {
  id: number;
  name: string;
  model: string;
  category_id: number;
  status: "active" | "inactive" | "maintenance";
}

export type EmployeeFormData = Omit<Employee, "id">;
export type CategoryFormData = Omit<Category, "id">;
export type DeviceFormData = Omit<Device, "id">;
