import { User, IUser, UserRole } from "../models/user.model";
import { BadRequestError, NotFoundError } from "../../../../shared/errors";

interface CreateUserInput {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  facultyId?: string;
  departmentId?: string;
  matricNumber?: string;
  staffId?: string;
  isLevelAdvisor?: boolean;
  levelAdvising?: number[];
}

interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  facultyId?: string;
  departmentId?: string;
  matricNumber?: string;
  staffId?: string;
  isLevelAdvisor?: boolean;
  levelAdvising?: number[];
}

interface UserQuery {
  role?: string;
  facultyId?: string;
  departmentId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export class UserService {
  static async create(data: CreateUserInput): Promise<IUser> {
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) throw new BadRequestError("User already exists");

    return User.create(data);
  }

  static async findAll(query: UserQuery = {}): Promise<{ users: IUser[]; total: number }> {
    const { role, facultyId, departmentId, isActive = true, page = 1, limit = 20 } = query;
    const filter: Record<string, unknown> = { isActive };

    if (role) filter.role = role;
    if (facultyId) filter.facultyId = facultyId;
    if (departmentId) filter.departmentId = departmentId;

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filter).sort({ lastName: 1, firstName: 1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return { users, total };
  }

  static async findById(id: string): Promise<IUser> {
    const user = await User.findById(id);
    if (!user) throw new NotFoundError("User not found");
    return user;
  }

  static async findByEmail(email: string): Promise<IUser> {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw new NotFoundError("User not found");
    return user;
  }

  static async findByFaculty(facultyId: string, role?: string): Promise<IUser[]> {
    const filter: Record<string, unknown> = { facultyId, isActive: true };
    if (role) filter.role = role;
    return User.find(filter).sort({ lastName: 1, firstName: 1 });
  }

  static async findByDepartment(departmentId: string, role?: string): Promise<IUser[]> {
    const filter: Record<string, unknown> = { departmentId, isActive: true };
    if (role) filter.role = role;
    return User.find(filter).sort({ lastName: 1, firstName: 1 });
  }

  static async updateProfile(id: string, data: UpdateUserInput): Promise<IUser> {
    const user = await User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!user) throw new NotFoundError("User not found");
    return user;
  }

  static async updateById(
    id: string,
    data: Partial<UpdateUserInput & { isActive: boolean }>
  ): Promise<IUser> {
    const user = await User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!user) throw new NotFoundError("User not found");
    return user;
  }

  static async deactivate(id: string): Promise<IUser> {
    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    if (!user) throw new NotFoundError("User not found");
    return user;
  }
}
