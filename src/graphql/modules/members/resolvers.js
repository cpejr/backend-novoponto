import _ from "lodash";
import jwt from "jsonwebtoken";

import { MemberModel } from "../../../models";
import { signInWithCustomToken } from "../../../services/FirebaseAuthentication";
import { AuthenticationError, UserInputError } from "apollo-server-errors";

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
    members: () => MemberModel.find(),
    membersByResponsible: (_, { responsibleId }) =>
      MemberModel.find({ responsibleId }),
    member: (_, { _id }) => MemberModel.findById(_id),
  },

  Mutation: {
    createMember: (_, { data }) => MemberModel.create(data),

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

    updateMember: (_, { memberId, data }) =>
      MemberModel.findOneAndUpdate(id, data, { new: true }),

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
      const accessToken = jwt.sign({ member }, process.env.ACCESS_TOKEN_SECRET);
      return { member: member, accessToken };
    },

    getSessionData: (_, __, context) => {
      if (!context.auth.authenticated)
        throw new AuthenticationError("Invalid authentication token");
      else return context.auth.member;
    },
  },
};
