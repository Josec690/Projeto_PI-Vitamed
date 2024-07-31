const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConsultaSchema = new Schema({
    medico: { type: Schema.Types.ObjectId, ref: 'User' },
    paciente: { type: Schema.Types.ObjectId, ref: 'User' },
    data: Date,
    horario: String,
    status: String
});

module.exports = mongoose.model('Consulta', ConsultaSchema);