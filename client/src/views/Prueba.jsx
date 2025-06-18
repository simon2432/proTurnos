import React, { useState } from 'react';
import { Menu } from "../components/Menu";
import { InfoE } from "../components/InfoE";
import "./Prueba.css";

function Prueba(){
    return (
        <div>
            <Menu/>
            
            <div className='in' >
            <InfoE/>
            </div>
            
            
        </div>
    );
}

export default  Prueba;