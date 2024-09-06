import { buildSchema } from 'graphql';
import { UserModel, ProfileModel } from './database.config';

// Define GraphQL schema
export const schema = buildSchema(`
    type Query {
      hello: String
      getUsers: [User]
      getUser(id: ID!): User
    }
  
    type Mutation {
      createUser(name: String!, email: String!, profileBio: String!): User
      updateUser(id: ID!, name: String, email: String, profileBio: String): User
      deleteUser(id: ID!): User
    }
  
    type User {
      id: ID
      name: String
      email: String
      profile: Profile
    }
  
    type Profile {
      id: ID
      bio: String
    }
  `);

// Resolvers for GraphQL queries and mutations
export const root = {
  hello: () => 'Hello, GraphQL!',

  getUsers: async () => {
    return await UserModel.find();
  },

  getUser: async ({ id }: { id: string }) => {
    return await UserModel.findById(id);
  },

  createUser: async ({
    name,
    email,
    profileBio,
  }: {
    name: string;
    email: string;
    profileBio: string;
  }) => {
    const profile = await ProfileModel.create({ bio: profileBio });
    const user = await UserModel.create({ name, email, profile: profile._id });
    return user;
  },

  updateUser: async ({
    id,
    name,
    email,
    profileBio,
  }: {
    id: string;
    name?: string;
    email?: string;
    profileBio?: string;
  }) => {
    const user = await UserModel.findById(id);
    if (!user) return null;

    if (name) user.name = name;
    if (email) user.email = email;

    if (profileBio) {
      const profile = await ProfileModel.findById(user.profile);
      if (profile) profile.bio = profileBio;
      await profile?.save();
    }

    await user.save();
    return user;
  },

  deleteUser: async ({ id }: { id: string }) => {
    const user = await UserModel.findByIdAndDelete(id);
    return user;
  },
};
