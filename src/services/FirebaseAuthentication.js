const { admin, firebase } = require("./Firebase");
require("firebase/auth");

async function createNewUser(email, password) {
	return firebase.auth().createUserWithEmailAndPassword(email, password);
}

async function deleteUser(uid) {
	return admin.auth().deleteUser(uid);
}

async function changeUserPassword(uid, newPassword) {
	return admin.auth().updateUser(uid, {
		password: newPassword,
	});
}

async function sendPasswordChangeEmail(emailAddress) {
	return firebase.auth().sendPasswordResetEmail(emailAddress);
}

async function changeUserEmail(uid, newEmail) {
	return admin.auth().updateUser(uid, {
		email: newEmail,
	});
}

async function loginWithEmailAndPassword(email, password) {
	return firebase.auth().signInWithEmailAndPassword(email, password);
}

async function signInWithCustomToken(token) {
	const credential = await firebase.auth.GoogleAuthProvider.credential(token);
	const response = await firebase.auth().signInWithCredential(credential);

	return response;
}

module.exports = {
	createNewUser,
	deleteUser,
	changeUserPassword,
	sendPasswordChangeEmail,
	changeUserEmail,
	loginWithEmailAndPassword,
	signInWithCustomToken,
};
