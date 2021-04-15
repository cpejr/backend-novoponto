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
    members: () => MemberModel.find().populate("role").populate("responsible"),
    membersByResponsible: (_, { responsibleId }) =>
      MemberModel.find({ responsibleId }).populate("role"),
    member: (_, { _id }) => MemberModel.findById(_id).populate("role"),
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

      return MemberModel.findByIdAndDelete(id)
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

    updateMember: (_, { memberId, data }, { auth }) => {
    console.log("🚀 ~ file: resolvers.js ~ line 70 ~ memberId", memberId)

      if (!auth.member)
        throw new AuthenticationError("O usário não está autenticado");

      if (!!memberId && auth.member.role?.access > 0) {
        return MemberModel.findOneAndUpdate({_id: memberId}, data, { new: true }).populate(
          "role"
        );
      } else if (!!memberId) {
        throw new ForbiddenError(
          "O usário não tem o nível de acesso necessário para realizar tal ação"
        );
      }

    },

    updateSelf: async (_, { data }, { auth }) => {
      let id = auth.member._id;

      let member = await MemberModel.findOneAndUpdate(id, data, {
        new: true,
      }).populate("role");

      member = member.toJSON({ virtuals: true });

      const accessToken = generateAccessToken(member);
      return { member: member, accessToken };
    },

    login: async (_, { tokenId }) => {
      let firebaseData;
      try {
        firebaseData = await signInWithCustomToken(tokenId);
      } catch (error) {
        throw new UserInputError("Google token inválido");
      }

      const { user, additionalUserInfo } = firebaseData;
      const { isNewUser, profile } = additionalUserInfo;
      const { uid } = user;
      const { picture, name } = profile;

      // Tentar encontrar o usuário com o ID da conta caso o usário não seja novo
      let member;
      if (!isNewUser)
        member = await MemberModel.findOne({ firebaseId: uid }).populate(
          "role"
        );

      // Se não encontrou nenhum membro, procure se existe algum com o nome da conta
      if (!!!member) {
        // Tente encontrar um membro e atualizar seus dados
        member = await MemberModel.findOneAndUpdate(
          {
            name: { $regex: new RegExp(`\\b${name}\\b`, "i") },
          },
          { firebaseId: uid, imageLink: picture },
          { new: true }
        ).populate("role");
      }

      // Caso ainda não tenha um membro, significa que o usuário esta tentando usar uma conta
      // não cadastrada no sistema
      if (!!!member) {
        throw new AuthenticationError(
          `O nome "${name}" não encontrado no sistema, favor entre em contato com alguem da diretoria de desenvolvimento`
        );
      }

      // Usuário logado com sucesso, gerar token de acesso
      member = member.toJSON({ virtuals: true });
      const accessToken = generateAccessToken(member);
      return { member: member, accessToken };
    },

    getSessionData: (_, __, { auth }) => {
      if (!auth.authenticated)
        throw new AuthenticationError("Invalid authentication token");
      else return auth.member;
    },
  },
};
