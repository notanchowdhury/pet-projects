import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Search, Filter, Volume2 } from 'lucide-react';
import { a1GermanVocabulary as myList, VocabularyItem } from '@/data/vocabularyData';
import { LEVELS, levelVocabulary } from '@/data/levelVocabulary';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const VocabularyTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [level, setLevel] = useState<string>('current');

  const a1GermanVocabulary: VocabularyItem[] = useMemo(() => {
    if (level === 'current') return myList;
    if (level === 'all') return levelVocabulary;
    return levelVocabulary.filter((i) => i.level === level);
  }, [level]);

  const levelCount = (l: string) =>
    l === 'current' ? myList.length : l === 'all' ? levelVocabulary.length : levelVocabulary.filter((i) => i.level === l).length;

  // Get unique categories
  const categories = useMemo<string[]>(() => {
    const cats = Array.from(new Set<string>(a1GermanVocabulary.map(item => item.category)));
    return ['all', ...(level === 'current' ? cats.sort() : cats)];
  }, [a1GermanVocabulary, level]);

  // Filter vocabulary based on search and category
  const filteredVocabulary = useMemo(() => {
    return a1GermanVocabulary.filter(item => {
      const matchesSearch = 
        item.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.german.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.pronunciation.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, a1GermanVocabulary]);

  const pronounceWord = (germanWord: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(germanWord);
      utterance.lang = 'de-DE'; // German language
      utterance.rate = 0.8; // Slightly slower for learning
      utterance.pitch = 1;
      utterance.volume = 1;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const exportToPDF = async () => {
    const doc = new jsPDF();
    try {
      const response = await fetch('/fonts/DejaVuSans.ttf');
      if (!response.ok) throw new Error('Font unavailable');
      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.length; i += 8192) {
        binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
      }
      doc.addFileToVFS('DejaVuSans.ttf', btoa(binary));
      doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'normal');
      doc.setFont('DejaVuSans', 'normal');
    } catch (error) {
      console.error('Could not load the Unicode font for the PDF', error);
      return;
    }
    
    // Title
    doc.setFontSize(20);
    doc.setFont('DejaVuSans', 'normal');
    doc.text(`German ${level === 'current' ? 'A1' : level === 'all' ? 'All Levels' : level} Vocabulary List`, 20, 20);
    
    // Subtitle
    doc.setFontSize(12);
    doc.setFont('DejaVuSans', 'normal');
    doc.text(`Complete vocabulary with ${filteredVocabulary.length} words`, 20, 30);
    doc.text('English - German - Pronunciation - Examples', 20, 40);

    // Prepare table data
    const tableData = filteredVocabulary.map(item => [
      item.english,
      item.german,
      item.pronunciation,
      item.germanExample,
      item.englishExample
    ]);

    // Add table
    autoTable(doc, {
      head: [['English', 'German', 'Pronunciation', 'German Example', 'English Example']],
      body: tableData,
      startY: 50,
      styles: {
        font: 'DejaVuSans',
        fontSize: 8,
        cellPadding: 2,
        lineColor: [215, 215, 215],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [54, 69, 79],
        textColor: [255, 255, 255],
        fontStyle: 'normal',
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },
      columnStyles: {
        0: { cellWidth: 25 }, // English
        1: { cellWidth: 30 }, // German
        2: { cellWidth: 25 }, // Pronunciation
        3: { cellWidth: 50 }, // German Example
        4: { cellWidth: 50 }, // English Example
      },
      margin: { top: 50, right: 10, bottom: 20, left: 10 },
    });

    // Save the PDF
    doc.save(`german-${level === 'current' ? 'a1' : level === 'all' ? 'all-levels' : level.toLowerCase()}-vocabulary.pdf`);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-primary">German {level === 'current' ? 'A1' : level === 'all' ? 'All Levels' : level} Vocabulary</h1>
          <p className="text-lg text-muted-foreground">
            Complete vocabulary list with pronunciation and examples
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {a1GermanVocabulary.length} Total Words
            </Badge>
            <Badge variant="outline" className="text-sm">
              {filteredVocabulary.length} Showing
            </Badge>
          </div>
        </div>

        {/* Level menu */}
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {['current', ...LEVELS, 'all'].map((l) => (
            <Button
              key={l}
              size="sm"
              variant={level === l ? 'default' : 'outline'}
              onClick={() => { setLevel(l); setSelectedCategory('all'); }}
            >
              {l === 'current' ? 'My A1 List' : l === 'all' ? 'All Levels' : l}
              <span className="ml-1 opacity-70">({levelCount(l)})</span>
            </Button>
          ))}
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search vocabulary..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>

              <Button onClick={exportToPDF} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Vocabulary Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-table-header text-primary-foreground">
                    <th className="p-4 text-left font-semibold">Article</th>
                    <th className="p-4 text-left font-semibold">English</th>
                    <th className="p-4 text-left font-semibold">German</th>
                    <th className="p-4 text-left font-semibold">Plural</th>
                    <th className="p-4 text-left font-semibold">Pronunciation</th>
                    <th className="p-4 text-left font-semibold">German Example</th>
                    <th className="p-4 text-left font-semibold">English Example</th>
                    <th className="p-2 text-center font-semibold"><Volume2 className="h-4 w-4 mx-auto" /></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVocabulary.map((item, index) => (
                    <tr 
                      key={index} 
                      className={`border-b transition-colors hover:bg-table-row-hover ${
                        index % 2 === 0 ? 'bg-table-row-even' : 'bg-background'
                      }`}
                    >
                      <td className="p-4">
                        {item.article ? (
                          <Badge 
                            variant="secondary" 
                            className={`text-xs font-bold ${
                              item.article === 'der' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              item.article === 'die' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' :
                              'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}
                          >
                            {item.article}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                      <td className="p-4 font-medium">{item.english}</td>
                      <td className="p-4 font-semibold text-primary">{item.german}</td>
                      <td className="p-4">
                        {item.plural ? (
                          <span className="text-sm text-muted-foreground">{item.plural}</span>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        {item.pronunciation ? (
                          <span className="rounded-md bg-pronunciation-bg px-2 py-1 text-sm font-mono text-pronunciation">
                            {item.pronunciation}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                      <td className="p-4 text-sm italic">{item.germanExample}</td>
                      <td className="p-4 text-sm text-muted-foreground">{item.englishExample}</td>
                      <td className="p-2 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => pronounceWord(item.german)}
                          className="hover:bg-accent h-8 w-8"
                          aria-label={`Pronounce ${item.german}`}
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>German vocabulary • {filteredVocabulary.length} words displayed</p>
        </div>
      </div>
    </div>
  );
};

export default VocabularyTable;