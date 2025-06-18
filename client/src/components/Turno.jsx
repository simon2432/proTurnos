import React from 'react';

function Turno({ hora, ocupado, onClick }) {
    return (
        <div 
            className={`turno ${ocupado ? 'ocupado' : ''}`} 
            onClick={onClick} 
            style={{ cursor: ocupado ? 'not-allowed' : 'pointer' }}
        >
            {hora}
        </div>
    );
}

export default Turno;