import { getDB } from "../services/Firebase";

// member {
//   firebase_id: string!;
//   name: string!;
//   status: string;
//   role_id: ref!;
//   image_link: string;
//   responsable_id: string;
// }

async function createMember({
  name,
  status,
  role_id,
  image_link,
  responsable_id,
}) {
  
  const data = {
    name,
    status,
    role_id: getDB().collection("roles").doc(role_id),
    image_link,
    //   responsable_id: getDB().collection("members").doc(responsable_id),
  };

  return await getDB().collection("members").add(data);
}

export default { createMember };
