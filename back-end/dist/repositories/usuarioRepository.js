"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.findByEmail = exports.findByNome = exports.findById = exports.findAll = exports.create = void 0;
const Usuario_1 = require("../models/Usuario");
const create = async (userData) => {
    const novoUsuario = new Usuario_1.Usuario(userData);
    return await novoUsuario.save();
};
exports.create = create;
const findAll = async () => {
    return await Usuario_1.Usuario.find().select('-senha');
};
exports.findAll = findAll;
const findById = async (id) => {
    return await Usuario_1.Usuario.findById(id).select('-senha');
};
exports.findById = findById;
// FUNÇÃO NOVA para login pelo nome (já existente)
const findByNome = async (nome) => {
    return await Usuario_1.Usuario.findOne({ nome });
};
exports.findByNome = findByNome;
// FUNÇÃO NOVA para login pelo email
const findByEmail = async (email) => {
    return await Usuario_1.Usuario.findOne({ email });
};
exports.findByEmail = findByEmail;
const update = async (id, updateData) => {
    return await Usuario_1.Usuario.findByIdAndUpdate(id, updateData, { new: true }).select('-senha');
};
exports.update = update;
const remove = async (id) => {
    return await Usuario_1.Usuario.findByIdAndDelete(id).select('-senha');
};
exports.remove = remove;
//# sourceMappingURL=usuarioRepository.js.map