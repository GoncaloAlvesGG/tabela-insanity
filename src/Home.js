import './App.css';
import axios from "axios";
import Table from "./tabela";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import loadingImage from './assets/waiting.gif';

const Home = () => {
    const [data, setData] = useState([]);
    const [tables, setTables] = useState([]);
    const [images, setImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedTable, setSelectedTable] = useState('');
    const [dynamicHeader, setDynamicHeader] = useState("501"); //Garantir que este valor é o primeiro obtido da tabela

    const columns = useMemo(
        () => [
            {
                Header: dynamicHeader,
                columns: [
                    {
                        Header: "Nome",
                        accessor: "nome",
                        Cell: ({ row }) => (
                            <span style={{ fontSize: `${row.index < 3 ? 34 - row.index : 28}px`, fontWeight: "bold" }}>
                                {row.original.nome}
                            </span>
                        ),
                    },
                    {
                        Header: "Resultado",
                        accessor: "resultado",
                        Cell: ({ row }) => (
                            <span style={{ fontSize: `${row.index < 3 ? 34 - row.index : 28}px`, fontWeight: "bold" }}>
                                {row.original.resultado}
                            </span>
                        ),
                    },
                ],
            },
        ],
        [dynamicHeader]
    );

    const handleDynamicHeaderChange = (Titulo) => {
        // Set the new dynamic header value
        setDynamicHeader(Titulo);
    };


    const fetchData = async () => {
        try {
            const resultTables = await axios("https://insanity-api.onrender.com/api/tables");
            const resultImages = await axios.get("https://insanity-api.onrender.com/api/listImage");
            const filteredTables = resultTables.data.tables.filter(table => table !== "Imagens");
            setTables(filteredTables);

            if (filteredTables.length > 0 && !selectedTable) {
                setSelectedTable(filteredTables[0]);
            }

            const validImageExtensions = [".jpg", ".jpeg", ".png"];
            const filteredImages = resultImages.data.filter(image =>
                validImageExtensions.some(ext => image.name.toLowerCase().endsWith(ext))
            );
            setImages(filteredImages);

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
        }
    };


    const rotateTableData = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % (tables.length + 1));

        if (currentIndex < tables.length) {
            const nextTableName = tables[(currentIndex + 1) % tables.length];
            handleDynamicHeaderChange(nextTableName);
        }
    }, [currentIndex, tables]);
    // useEffect for initial data fetching
    useEffect(() => {

        fetchData();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTable]);

    const rotateImage = useCallback(() => {
        setCurrentImageIndex((prevIndex) => {
            if (prevIndex === images.length - 1) {
                // If the current index is the last index, reset to 0
                setCurrentIndex(0);
                return 0;
            } else {
                // Otherwise, increment the index
                return prevIndex + 1;
            }
        });
    }, [setCurrentImageIndex, images]);

    // useEffect for interval to rotate data
    useEffect(() => {
        const intervalId = setInterval(() => {
            if (currentIndex < tables.length) {
                rotateTableData();
            } else {
                rotateImage();
            }
        }, 5000);

        return () => clearInterval(intervalId);
    }, [rotateTableData, currentIndex, tables, images, rotateImage]);



    console.log("Data:", data[currentIndex]?.data || []);
    return (
        <div className="App">
            {data.length === 0 ? (
                <div className="loading-container">
                    <p className="loading-text">
                        Se está preso, culpem a merda do Render. Aguardar um pouco!
                    </p>
                    <img
                        src={loadingImage}
                        alt="Loading"
                        className="loading-gif"
                    />
                </div>
            ) : (
                <div>
                    {currentIndex < tables.length ? (
                        <Table columns={columns} data={data[currentIndex]?.data || []} />
                    ) : (
                        currentIndex >= tables.length && (
                            <div>
                                <img
                                    src={"https://drive.google.com/thumbnail?id=" + images[currentImageIndex].id + "&sz=w1000"}
                                    alt={`Imagem ${currentImageIndex}`}
                                    className="image-class" />
                            </div>
                        )
                    )}
                </div>
            )}


        </div>
    )

}
export default Home;