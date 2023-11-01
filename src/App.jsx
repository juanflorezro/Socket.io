import './App.css';
import io from 'socket.io-client';
import { FaPaperclip } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';

const socket = io(); 

export default function App() {
  const [mensaje, setMensaje] = useState('');
  const [mensajes, setMensajes] = useState([]);
  const [archivo, setArchivo] = useState(null);
  const [enviandoArchivo, setEnviandoArchivo] = useState(false);

  const mensajesRef = useRef();

  useEffect(() => {
    socket.on('mensaje', receiveMensaje);
    socket.on('archivo', receiveArchivo);
    return () => {
      socket.off('mensaje', receiveMensaje);
      socket.off('archivo', receiveArchivo);
    };
  }, []);  

  useEffect(() => {
    mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
  }, [mensajes]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setArchivo(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (archivo) {
      setEnviandoArchivo(true);

      const reader = new FileReader();

      reader.onload = (e) => {
        const fileData = e.target.result;
        const fileName = archivo.name;

        socket.emit('archivo', { fileName, fileData });
        setArchivo(null);
        setEnviandoArchivo(false);
      };

      reader.readAsDataURL(archivo);
    } else if (mensaje) {
      socket.emit('mensaje', mensaje);
      setMensajes((mensajes) => [...mensajes, { body: mensaje, from: 'Yo' }]);
      setMensaje('');
    }
  };

  const receiveMensaje = (mensaje) => setMensajes((mensajes) => [...mensajes, mensaje]);

  const receiveArchivo = (archivo) => {
    setMensajes((mensajes) => [
      ...mensajes,
      {
        body: `Archivo recibido: ${archivo.fileName}`,
        from: 'Otro',
        archivo: archivo.fileData
      }
    ]);
  };
  
  return (
    <div className="App">
      <div className="chat" ref={mensajesRef}>
        {mensajes.map((mensaje, i) => (
          <div key={i} className={`mensaje ${mensaje.from === 'Yo' ? 'mensaje-propio' : 'mensaje-otro'}`}>
            {mensaje.from !== 'Yo' && <div className="from">{mensaje.from}</div>}
            {mensaje.body}
            
            {mensaje.archivo && (
              <a href={mensaje.archivo} download>
                Descargar archivo
              </a>
            )}
          </div>
        ))}
      </div>
      <form className="input-form" onSubmit={handleSubmit}>
        <input
          className="input-mensaje"
          placeholder='Escribe un mensaje...'
          type='text'
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
        ></input>
        <input type="file" id="fileInput" style={{ display: 'none' }} onChange={handleFileUpload} />
<label htmlFor="fileInput" className="file-input-label">
  <FaPaperclip size={20} color="#007bff" />
</label>
        <button type='submit' disabled={enviandoArchivo}>Enviar</button>
        {enviandoArchivo && <span>Enviando archivo...</span>}
      </form>
    </div>
  );
}

