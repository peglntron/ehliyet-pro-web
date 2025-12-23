import React from 'react';
import { Button, Paper, Divider } from '@mui/material';
import {
  FormatBold as FormatBoldIcon,
  FormatItalic as FormatItalicIcon,
  FormatUnderlined as FormatUnderlinedIcon,
  FormatListBulleted as FormatListBulletedIcon,
  InsertLink as InsertLinkIcon,
  TextFields as TextFieldsIcon,
  ShortText as ShortTextIcon,
  Title as TitleIcon,
  FormatQuote as FormatQuoteIcon,
  Code as CodeIcon,
  Image as ImageIcon,
  FormatColorText as FormatColorTextIcon
} from '@mui/icons-material';

interface HtmlEditorToolbarProps {
  textareaId: string;
  onFormat: (format: string, value?: string) => void;
}

export const HtmlEditorToolbar: React.FC<HtmlEditorToolbarProps> = ({ textareaId, onFormat }) => {
  return (
    <Paper 
      variant="outlined" 
      sx={{ 
        p: 1, 
        mb: 1, 
        borderRadius: 1,
        display: 'flex',
        gap: 1,
        flexWrap: 'wrap'
      }}
    >
      {/* Temel Formatlama */}
      <Button 
        size="small" 
        variant="text"
        onClick={() => onFormat('bold')}
        startIcon={<FormatBoldIcon />}
      >
        Kalın
      </Button>
      <Button 
        size="small" 
        variant="text"
        onClick={() => onFormat('italic')}
        startIcon={<FormatItalicIcon />}
      >
        İtalik
      </Button>
      <Button 
        size="small" 
        variant="text"
        onClick={() => onFormat('underline')}
        startIcon={<FormatUnderlinedIcon />}
      >
        Altı Çizili
      </Button>
      
      <Divider orientation="vertical" flexItem />
      
      {/* Başlıklar */}
      <Button 
        size="small" 
        variant="text"
        onClick={() => onFormat('h1')}
        startIcon={<TitleIcon />}
      >
        H1
      </Button>
      <Button 
        size="small" 
        variant="text"
        onClick={() => onFormat('h2')}
        startIcon={<TitleIcon />}
      >
        H2
      </Button>
      <Button 
        size="small" 
        variant="text"
        onClick={() => onFormat('h3')}
        startIcon={<TitleIcon />}
      >
        H3
      </Button>
      
      <Divider orientation="vertical" flexItem />
      
      {/* Listeler */}
      <Button 
        size="small" 
        variant="text"
        onClick={() => onFormat('list')}
        startIcon={<FormatListBulletedIcon />}
      >
        Liste
      </Button>
      <Button 
        size="small" 
        variant="text"
        onClick={() => onFormat('romanList')}
        startIcon={<FormatListBulletedIcon />}
      >
        Roma Listesi
      </Button>
      
      <Divider orientation="vertical" flexItem />
      
      {/* Renkler */}
      <Button 
        size="small" 
        variant="text"
        onClick={() => onFormat('red')}
        startIcon={<FormatColorTextIcon />}
        sx={{ color: 'red' }}
      >
        Kırmızı
      </Button>
      <Button 
        size="small" 
        variant="text"
        onClick={() => onFormat('blue')}
        startIcon={<FormatColorTextIcon />}
        sx={{ color: 'blue' }}
      >
        Mavi
      </Button>
      <Button 
        size="small" 
        variant="text"
        onClick={() => onFormat('green')}
        startIcon={<FormatColorTextIcon />}
        sx={{ color: 'green' }}
      >
        Yeşil
      </Button>
      <Button 
        size="small" 
        variant="text"
        onClick={() => onFormat('orange')}
        startIcon={<FormatColorTextIcon />}
        sx={{ color: 'orange' }}
      >
        Turuncu
      </Button>
      <Button 
        size="small" 
        variant="text"
        onClick={() => onFormat('purple')}
        startIcon={<FormatColorTextIcon />}
        sx={{ color: 'purple' }}
      >
        Mor
      </Button>
      
      <Divider orientation="vertical" flexItem />
      
      {/* Özel Formatlar */}
      <Button 
        size="small" 
        variant="text"
        onClick={() => onFormat('quote')}
        startIcon={<FormatQuoteIcon />}
      >
        Alıntı
      </Button>
      <Button 
        size="small" 
        variant="text"
        onClick={() => onFormat('code')}
        startIcon={<CodeIcon />}
      >
        Kod
      </Button>
      <Button 
        size="small" 
        variant="text"
        onClick={() => onFormat('codeblock')}
        startIcon={<CodeIcon />}
      >
        Kod Bloğu
      </Button>
      
      <Divider orientation="vertical" flexItem />
      
      {/* Diğer */}
      <Button 
        size="small" 
        variant="text"
        onClick={() => onFormat('link')}
        startIcon={<InsertLinkIcon />}
      >
        Link
      </Button>
      <Button 
        size="small" 
        variant="text"
        onClick={() => onFormat('image')}
        startIcon={<ImageIcon />}
      >
        Görsel
      </Button>
      <Button 
        size="small" 
        variant="text"
        onClick={() => onFormat('paragraph')}
        startIcon={<TextFieldsIcon />}
      >
        Paragraf
      </Button>
      <Button 
        size="small" 
        variant="text"
        onClick={() => onFormat('linebreak')}
        startIcon={<ShortTextIcon />}
      >
        Satır Sonu
      </Button>
    </Paper>
  );
};

// Format text fonksiyonu - hook olarak kullanılabilir
export const useHtmlFormatter = (textareaId: string, value: string, onChange: (value: string) => void) => {
  const formatText = (format: string, customValue?: string) => {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let formattedText = '';
    switch(format) {
      case 'bold':
        formattedText = `<strong>${selectedText}</strong>`;
        break;
      case 'italic':
        formattedText = `<em>${selectedText}</em>`;
        break;
      case 'underline':
        formattedText = `<u>${selectedText}</u>`;
        break;
      case 'h1':
        formattedText = `<h1>${selectedText}</h1>`;
        break;
      case 'h2':
        formattedText = `<h2>${selectedText}</h2>`;
        break;
      case 'h3':
        formattedText = `<h3>${selectedText}</h3>`;
        break;
      case 'list':
        formattedText = `<ul>\n<li>${selectedText}</li>\n</ul>`;
        break;
      case 'romanList':
        formattedText = `<ol class="roman-list">\n<li>${selectedText}</li>\n</ol>`;
        break;
      case 'link':
        const url = customValue || prompt('Link URL\'si girin:') || '#';
        formattedText = `<a href="${url}">${selectedText}</a>`;
        break;
      case 'paragraph':
        formattedText = `<p>${selectedText}</p>`;
        break;
      case 'linebreak':
        formattedText = `${selectedText}<br>`;
        break;
      case 'red':
        formattedText = `<span style="color: red">${selectedText}</span>`;
        break;
      case 'blue':
        formattedText = `<span style="color: blue">${selectedText}</span>`;
        break;
      case 'green':
        formattedText = `<span style="color: green">${selectedText}</span>`;
        break;
      case 'orange':
        formattedText = `<span style="color: orange">${selectedText}</span>`;
        break;
      case 'purple':
        formattedText = `<span style="color: purple">${selectedText}</span>`;
        break;
      case 'quote':
        formattedText = `<blockquote>${selectedText}</blockquote>`;
        break;
      case 'code':
        formattedText = `<code>${selectedText}</code>`;
        break;
      case 'codeblock':
        formattedText = `<pre><code>${selectedText}</code></pre>`;
        break;
      case 'image':
        const imageUrl = customValue || prompt('Görsel URL\'si girin:') || '';
        const altText = selectedText || 'Görsel';
        formattedText = `<img src="${imageUrl}" alt="${altText}" style="max-width: 100%; height: auto;">`;
        break;
      default:
        formattedText = selectedText;
    }
    
    const newText = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
    onChange(newText);
    
    // Cursor pozisyonunu ayarla
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + formattedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return { formatText };
};
