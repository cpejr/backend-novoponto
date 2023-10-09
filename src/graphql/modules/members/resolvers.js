import _ from "lodash";
import jwt from "jsonwebtoken";

import { MemberModel } from "../../../models";
import { signInWithCustomToken } from "../../../services/FirebaseAuthentication";
import {
  AuthenticationError,
  ForbiddenError,
  UserInputError,
} from "apollo-server-errors";

function generateAccessToken(member) {
  return jwt.sign({ member }, process.env.ACCESS_TOKEN_SECRET);
}

export default {
  Member: {
    responsible: ({ responsible, responsibleId }) => {
      // Se já existir o responsável, não faça a requisição novamente.
      if (responsible) return responsible;
      if (responsibleId) return MemberModel.findById(responsibleId);
      return;
    },
  },

  Query: {
    members: (_, { accessArray }) =>
      MemberModel.getMembersWithAccessArray(accessArray),
    membersByResponsible: (_, { responsibleId }) =>
      MemberModel.find({ responsibleId }).populate("role").populate("tribe").populate("departament").populate("Badge"),
    member: (_, { _id }) =>
      MemberModel.findById(_id).populate("role").populate("tribe").populate("departament").populate("Badge"),
  },

  Mutation: {
    createMember: (_, { data }) => MemberModel.create(data),

    deleteMember: (_, { memberId }, { auth }) => {
      var id;
      if (!auth.member)
        throw new AuthenticationError("O usário não está autenticado");

      if (!!memberId && auth.member.role?.access > 0) {
        id = memberId;
      } else if (!!memberId) {
        throw new ForbiddenError(
          "O usário não tem o nível de acesso necessário para realizar tal ação"
        );
      }

      return MemberModel.findByIdAndDelete(id);
    },

    addMandatory: (_, { memberId, data }) =>
      MemberModel.findByIdAndUpdate(
        memberId,
        { $push: { mandatories: data } },
        { new: true }
      ),

    removeMandatory: (_, { memberId, mandatoryId }) =>
      MemberModel.findOneAndUpdate(
        {
          _id: memberId,
        },
        {
          $pull: { mandatories: { $elemMatch: { _id: mandatoryId } } },
        }
      ),

    updateMember: async (_, { memberId, data }, { auth }) => {
      if (!auth.member)
        throw new AuthenticationError("O usário não está autenticado");

      if (!!memberId && auth.member.role?.access > 0) {
        return MemberModel.findOneAndUpdate(
          { _id: memberId },
          { $set: data },
          {
            new: true,
          }
        )
          .populate("role")
          .populate("tribe")
          .populate("departament")
          .populate("Badge");
      } else if (!!memberId) {
        throw new ForbiddenError(
          "O usário não tem o nível de acesso necessário para realizar tal ação"
        );
      }
    },

    updateSelf: async (_, { data }, { auth }) => {
      let id = auth.member._id;

      let member = await MemberModel.findOneAndUpdate({ _id: id }, data, {
        new: true,
      })
        .populate("role")
        .populate("tribe")
        .populate("departament")
        .populate("Badge");
      member = member.toJSON({ virtuals: true });

      const accessToken = generateAccessToken(member);
      return { member: member, accessToken };
    },

    login: async (_, { data: { uid, email, photoURL } }) => {
      const foundMember = await MemberModel.findOne({ email })
        .populate(["role", "tribe","departament", "Badge"])
        .exec();
      if (!foundMember)
        throw new AuthenticationError(
          `O e-mail "${email}" não foi encontrado no sistema, favor entre em contato com alguem da diretoria de desenvolvimento`
        );

      const member =
        foundMember.toObject().firebaseId === uid
          ? foundMember
          : await foundMember
              .set({ firebaseId: uid, imageLink: photoURL }) // First time login
              .save();

      // Usuário logado com sucesso, gerar token de acesso
      const accessToken = generateAccessToken(member);
      return { member: member.toJSON({ virtuals: true }), accessToken };
    },

    getSessionData: async (_, __, { auth }) => {
      if (!auth.authenticated)
        throw new AuthenticationError("Invalid authentication token");

      const { updatedAt } =
        (await MemberModel.findById(auth.member._id).select("updatedAt")) || {};

      if (!updatedAt)
        throw new AuthenticationError("Invalid authentication token");

      if (auth?.member?.updatedAt !== updatedAt) {
        let newMember = await MemberModel.findOne({
          _id: auth.member._id,
        })
          .populate("role")
          .populate("tribe")
          .populate("departament")
          .populate("Badge");

        newMember = newMember.toJSON({ virtuals: true });

        const accessToken = generateAccessToken(newMember);

        return { member: newMember, accessToken };
      }

      return { member: auth.member };
    },
  },
};
