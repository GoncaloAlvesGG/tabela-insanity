import axios from "axios";
import React, { useState, useEffect } from "react";


const AddValor = () => {
    const [selectedTable, setSelectedTable] = useState('');
    const [tables, setTables] = useState([]);
    const [data, setData] = useState([]);
    const [currentIndex] = useState(0);
    const [error, setError] = useState(null);
    const [newData, setNewData] = useState({
        nome: "",
        resultado: "",
    });

    const fetchData = async () => {
        try {
            const resultTables = await axios("https://insanity-api.onrender.com/api/tables");
            const filteredTables = resultTables.data.tables.filter(table => table !== "Imagens");
            setTables(filteredTables);

            if (filteredTables.length > 0 && !selectedTable) {
                setSelectedTable(filteredTables[0]);
            }

            setError(null);

            const allData = [];

            for (const tableName of filteredTables) {
                const result = await axios(`https://insanity-api.onrender.com/api/fetch/${tableName}`);
                const tableData = {
                    tableName: tableName,
                    data: result.data,
                };
                allData.push(tableData);
            }

            setData(allData);
        } catch (error) {
            console.error("Error fetching data:", error.message);
            setError("Error fetching data. Please try again.");
        }
    };


    const handleAdd = async () => {
        try {
            if (!selectedTable || !newData.nome || !newData.resultado || isNaN(newData.resultado) || newData.resultado < 0) {
                setError("Introduza um nome/resultado válido!");
                return;
            }

            const response = await axios.post(`https://insanity-api.onrender.com/api/insert/${selectedTable}`, newData);

            const updatedData = [...data, response.data];
            setData(updatedData);
            setError(null);
            setNewData({
                nome: "",
                resultado: "",
            });
            fetchData(selectedTable);
        } catch (error) {
            console.error("Error inserting data:", error.message);
            setError("Error inserting data. Please try again.");
        }
    };

    const handleInputChange = (e) => {
        // Update the new data state when text boxes change
        setNewData({
            ...newData,
            [e.target.name]: e.target.value,
        });
    };

    const handleTableChange = (e) => {
        setSelectedTable(e.target.value);
    };

    useEffect(() => {

        fetchData();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTable]);

    console.log("Data:", data[currentIndex]?.data || []);
    return <div className="add-form">

        <select onChange={handleTableChange} value={selectedTable}>
            <option value="" disabled>Tabela</option>
            {tables.map(table => (
                <option key={table} value={table}>{table}</option>
            ))}
        </select>

        <input
            type="text"
            placeholder="Nome"
            name="nome"
            value={newData.nome}
            onChange={handleInputChange}
        />
        <input
            type="text"
            placeholder="Resultado"
            name="resultado"
            value={newData.resultado}
            onChange={handleInputChange}
        />
        <button className="confirm-button" onClick={handleAdd}>
            Confirmar
        </button>

        {error && (
            <div className="error-container">
                <p className="error-text">{error}</p>
            </div>
        )}

    </div>
}

export default AddValor;