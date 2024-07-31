function excluirConsulta(id) {
    if (confirm('Tem certeza que deseja excluir esta consulta?')) {
        fetch(`/agendamentos/${id}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao excluir consulta');
            }
            return response.json();
        })
        .then(data => {
            alert(data.message);
            location.reload(); // Recarrega a página para atualizar o histórico de consultas
        })
        .catch(error => console.error('Erro:', error));
    }
}