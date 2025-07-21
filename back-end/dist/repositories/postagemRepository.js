"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.findById = exports.findAll = exports.create = void 0;
const Postagem_1 = require("../models/Postagem");
const create = async (postData) => {
    const novaPostagem = new Postagem_1.Postagem(postData);
    return await novaPostagem.save();
};
exports.create = create;
const findAll = async () => {
    return await Postagem_1.Postagem.find()
        .populate('autor', 'nome email')
        .select('-__v')
        .sort({ data: -1 });
};
exports.findAll = findAll;
const findById = async (id) => {
    return await Postagem_1.Postagem.findById(id).populate('autor', 'nome email');
};
exports.findById = findById;
const update = async (id, updateData) => {
    return await Postagem_1.Postagem.findByIdAndUpdate(id, updateData, { new: true });
};
exports.update = update;
const remove = async (id) => {
    return await Postagem_1.Postagem.findByIdAndDelete(id);
};
exports.remove = remove;
//# sourceMappingURL=postagemRepository.js.map