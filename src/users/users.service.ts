import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Create a new user (doctor)
   * Hashes password if provided
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password if provided
    if (createUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      createUserDto.password = await bcrypt.hash(createUserDto.password, salt);
    }

    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  /**
   * Find all users
   */
  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        specialization: true,
        licenseNumber: true,
        profilePhoto: true,
        provider: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Find user by ID (without password)
   */
  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        specialization: true,
        licenseNumber: true,
        profilePhoto: true,
        provider: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Find user by email (with password for authentication)
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  /**
   * Find user by Google ID
   */
  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { googleId },
    });
  }

  /**
   * Find user by Facebook ID
   */
  async findByFacebookId(facebookId: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { facebookId },
    });
  }

  /**
   * Update user information
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // If updating password, hash it
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    // If updating email, check if it's already taken
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  /**
   * Delete a user (soft delete by setting isActive to false)
   */
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    user.isActive = false;
    await this.usersRepository.save(user);
  }

  /**
   * Validate user password
   */
  async validatePassword(user: User, password: string): Promise<boolean> {
    if (!user.password) return false;
    return bcrypt.compare(password, user.password);
  }

  /**
   * Create or update user from OAuth provider
   */
  async findOrCreateOAuthUser(profile: {
    provider: 'google' | 'facebook';
    providerId: string;
    email: string;
    name: string;
    photo?: string;
  }): Promise<User> {
    // Try to find user by provider ID
    let user: User | null = null;

    if (profile.provider === 'google') {
      user = await this.findByGoogleId(profile.providerId);
    } else if (profile.provider === 'facebook') {
      user = await this.findByFacebookId(profile.providerId);
    }

    // If found, return user
    if (user) {
      return user;
    }

    // If not found, try to find by email
    user = await this.findByEmail(profile.email);

    if (user) {
      // Update user with provider ID
      if (profile.provider === 'google') {
        user.googleId = profile.providerId;
      } else if (profile.provider === 'facebook') {
        user.facebookId = profile.providerId;
      }
      return this.usersRepository.save(user);
    }

    // Create new user
    const newUser = this.usersRepository.create({
      email: profile.email,
      name: profile.name,
      provider: profile.provider,
      profilePhoto: profile.photo,
      isEmailVerified: true, // OAuth emails are pre-verified
      googleId: profile.provider === 'google' ? profile.providerId : undefined,
      facebookId: profile.provider === 'facebook' ? profile.providerId : undefined,
    });

    return this.usersRepository.save(newUser);
  }
}
