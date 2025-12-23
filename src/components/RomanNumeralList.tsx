import React from 'react';

interface RomanNumeralListProps {
  items: string[];
  className?: string;
}

const RomanNumeralList: React.FC<RomanNumeralListProps> = ({ items, className }) => {
  const convertToRoman = (num: number): string => {
    if (num <= 0 || num > 1000) return 'N/A';
    
    const romanNumerals = [
      { value: 1000, numeral: 'M' },
      { value: 900, numeral: 'CM' },
      { value: 500, numeral: 'D' },
      { value: 400, numeral: 'CD' },
      { value: 100, numeral: 'C' },
      { value: 90, numeral: 'XC' },
      { value: 50, numeral: 'L' },
      { value: 40, numeral: 'XL' },
      { value: 10, numeral: 'X' },
      { value: 9, numeral: 'IX' },
      { value: 5, numeral: 'V' },
      { value: 4, numeral: 'IV' },
      { value: 1, numeral: 'I' }
    ];
    
    let result = '';
    let remaining = num;
    
    for (const { value, numeral } of romanNumerals) {
      while (remaining >= value) {
        result += numeral;
        remaining -= value;
      }
    }
    
    return result;
  };
  
  return (
    <ol className={`roman-list ${className || ''}`}>
      {items.map((item, index) => (
        <li key={index}>
          <span className="roman-numeral">{convertToRoman(index + 1)}.</span>
          <span className="roman-content">{item}</span>
        </li>
      ))}
      <style>{`
        .roman-list {
          list-style-type: none;
          padding: 0;
          margin: 0;
        }
        .roman-list li {
          padding-left: 2rem;
          position: relative;
          margin-bottom: 0.5rem;
        }
        .roman-numeral {
          position: absolute;
          left: 0;
          font-weight: bold;
          color: #1976d2;
        }
        .roman-content {
          display: inline-block;
        }
      `}</style>
    </ol>
  );
};

export default RomanNumeralList;
