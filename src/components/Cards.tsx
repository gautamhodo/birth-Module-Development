import React from 'react';
import '../styles/cards.css'

export interface CardProps {
  title: string;
  subtitle?: number | string;
}
const Cards: React.FC<CardProps> = ({title,subtitle}) => {

  return (
    <>
        {/* <div className="dashboard-summary-cards"> */}
        
          <div className="summary-card">
            <div className="summary-title">{title}</div>
            {subtitle !== undefined && subtitle !== null && subtitle !== 0 && (
              <div className="summary-value">{subtitle}</div>
            )}
          </div>
        {/* </div> */}
    </>
  );
};

export default Cards; 

