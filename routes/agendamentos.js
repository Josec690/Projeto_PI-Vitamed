const express = require('express');
const router = express.Router();
const Agendamento = require('../models/agendamento');

// Rota para excluir uma consulta
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const agendamento = await Agendamento.findByPk(id);
        if (agendamento) {
            await agendamento.destroy();
            res.status(200).json({ message: 'Consulta excluída com sucesso.' });
        } else {
            res.status(404).json({ message: 'Consulta não encontrada.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao excluir consulta.', error });
    }
});

// Rota para reagendar uma consulta
router.put('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { data, especialidade } = req.body;
        const agendamento = await Agendamento.findByPk(id);

        if (agendamento) {
            agendamento.data = data;
            agendamento.especialidade = especialidade;
            await agendamento.save();
            res.status(200).json({ message: 'Consulta reagendada com sucesso.' });
        } else {
            res.status(404).json({ message: 'Consulta não encontrada.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao reagendar consulta.', error });
    }
});

module.exports = router;