import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

interface DayHistory {
  date: string;
  completedCount: number;
  totalCount: number;
}

const STORAGE_KEY = 'hypothyroid-checklist-history';

const Index = () => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: 'pill', label: 'Таблетка принята утром натощак', checked: false },
    { id: 'energy', label: 'Уровень энергии в норме', checked: false },
    { id: 'mood', label: 'Настроение стабильное', checked: false },
    { id: 'noSwelling', label: 'Нет новых отеков', checked: false },
    { id: 'normalTemp', label: 'Не жалуется на холод', checked: false },
  ]);

  const [history, setHistory] = useState<DayHistory[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('data');
    
    if (sharedData) {
      try {
        const decodedData = JSON.parse(atob(sharedData));
        setHistory(decodedData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(decodedData));
        toast.success('Данные загружены из ссылки');
        window.history.replaceState({}, '', window.location.pathname);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        toast.error('Не удалось загрузить данные из ссылки');
      }
    } else {
      const savedHistory = localStorage.getItem(STORAGE_KEY);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    }
  }, []);

  const saveHistory = (newHistory: DayHistory[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    setHistory(newHistory);
  };

  const handleChecklistToggle = (id: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const resetChecklist = () => {
    const completedCount = checklist.filter(item => item.checked).length;
    const today = new Date().toLocaleDateString('ru-RU');
    
    const existingDayIndex = history.findIndex(day => day.date === today);
    let newHistory: DayHistory[];
    
    if (existingDayIndex >= 0) {
      newHistory = [...history];
      newHistory[existingDayIndex] = {
        date: today,
        completedCount,
        totalCount: checklist.length
      };
    } else {
      newHistory = [
        ...history,
        {
          date: today,
          completedCount,
          totalCount: checklist.length
        }
      ].slice(-7);
    }
    
    saveHistory(newHistory);
    setChecklist(prev => prev.map(item => ({ ...item, checked: false })));
  };

  const completedCount = checklist.filter(item => item.checked).length;
  const progress = (completedCount / checklist.length) * 100;

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toLocaleDateString('ru-RU');
  });

  const weekData = last7Days.map(date => {
    const dayData = history.find(h => h.date === date);
    return {
      date,
      shortDate: date.split('.')[0] + '.' + date.split('.')[1],
      percentage: dayData ? Math.round((dayData.completedCount / dayData.totalCount) * 100) : 0,
      completed: dayData?.completedCount || 0,
      total: dayData?.totalCount || 0
    };
  });

  const averageCompletion = weekData.reduce((sum, day) => sum + day.percentage, 0) / 7;

  const shareData = async () => {
    try {
      const dataToShare = btoa(JSON.stringify(history));
      const shareUrl = `${window.location.origin}${window.location.pathname}?data=${dataToShare}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Памятка: Гипотиреоз',
          text: 'История наблюдений за пациентом с гипотиреозом',
          url: shareUrl
        });
        toast.success('Ссылка успешно отправлена!');
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Ссылка скопирована в буфер обмена!');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Ошибка при создании ссылки:', error);
        toast.error('Не удалось создать ссылку');
      }
    }
  };

  const exportToPDF = async () => {
    if (!contentRef.current) return;
    
    setIsExporting(true);
    toast.loading('Создаю PDF...');
    
    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#fafafa'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      const fileName = `pamyatka-gipotireoz-${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.pdf`;
      pdf.save(fileName);
      
      toast.success('PDF успешно создан!');
    } catch (error) {
      console.error('Ошибка при создании PDF:', error);
      toast.error('Не удалось создать PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
          <Button
            onClick={exportToPDF}
            disabled={isExporting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
            size="lg"
          >
            <Icon name="Download" className="mr-2" size={20} />
            {isExporting ? 'Создание PDF...' : 'Скачать PDF'}
          </Button>
          <Button
            onClick={shareData}
            disabled={history.length === 0}
            variant="secondary"
            className="shadow-lg"
            size="lg"
          >
            <Icon name="Share2" className="mr-2" size={20} />
            Поделиться
          </Button>
        </div>
        <div ref={contentRef}>
        <header className="text-center space-y-4 animate-fade-in">
          <Badge className="bg-primary text-primary-foreground text-sm px-4 py-1.5">
            Памятка для родственников
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            ВАША ПОМОЩЬ БЕСЦЕННА
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-medium">
            Советы родным пациента с гипотиреозом
          </p>
        </header>

        <Card className="border-2 border-accent/20 bg-accent/5 animate-scale-in">
          <CardContent className="pt-6">
            <p className="text-lg text-foreground leading-relaxed">
              <strong>Гипотиреоз – это не лень и не плохой характер.</strong> Это болезнь, которая вызывает усталость, забывчивость и подавленность.
            </p>
          </CardContent>
        </Card>

        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Icon name="Heart" className="text-primary" size={32} />
            ЧТО ВЫ МОЖЕТЕ СДЕЛАТЬ
          </h2>

          <div className="grid gap-4 md:gap-5">
            <Card className="hover-scale transition-all hover:shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-start gap-3 text-xl">
                  <Icon name="Bell" className="text-primary mt-1 flex-shrink-0" size={24} />
                  <span>1. БУДЬТЕ «БУДИЛЬНИКОМ»</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">
                  Тактично напоминайте о ежедневном приеме таблетки утром. Можно поставить общее напоминание на телефон.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-scale transition-all hover:shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-start gap-3 text-xl">
                  <Icon name="Apple" className="text-secondary mt-1 flex-shrink-0" size={24} />
                  <span>2. ПОМОГАЙТЕ С ДИЕТОЙ</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">
                  Готовьте вместе полезные блюда с овощами и клетчаткой. Избегайте соблазнов (не покупайте много сладкого и выпечки).
                </p>
              </CardContent>
            </Card>

            <Card className="hover-scale transition-all hover:shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-start gap-3 text-xl">
                  <Icon name="Users" className="text-primary mt-1 flex-shrink-0" size={24} />
                  <span>3. БУДЬТЕ ТЕРПЕЛИВЫ</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">
                  Не говорите «возьми себя в руки». Лучше предложите помощь по дому или спокойную совместную прогулку.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-destructive/30 bg-destructive/5 hover-scale transition-all hover:shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-start gap-3 text-xl text-destructive">
                  <Icon name="AlertTriangle" className="mt-1 flex-shrink-0" size={24} />
                  <span>4. СЛЕДИТЕ ЗА «ТРЕВОЖНЫМИ ЗВОНКАМИ»</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-foreground leading-relaxed">
                  Вы можете заметить опасные симптомы раньше самого пациента:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2 text-foreground">
                    <span className="text-destructive mt-1">•</span>
                    <span>Сильная заторможенность, необычная сонливость, спутанность речи</span>
                  </li>
                  <li className="flex items-start gap-2 text-foreground">
                    <span className="text-destructive mt-1">•</span>
                    <span>Нарастающие отеки на лице</span>
                  </li>
                  <li className="flex items-start gap-2 text-foreground">
                    <span className="text-destructive mt-1">•</span>
                    <span>Жалобы на сильный холод</span>
                  </li>
                </ul>
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mt-4">
                  <p className="font-semibold text-destructive text-center text-lg">
                    При этих симптомах – срочно к врачу!
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-scale transition-all hover:shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-start gap-3 text-xl">
                  <Icon name="Stethoscope" className="text-primary mt-1 flex-shrink-0" size={24} />
                  <span>5. ПОДДЕРЖИВАЙТЕ ВИЗИТЫ К ВРАЧУ</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">
                  Помогите записаться, сопроводите. Поддержка на приеме снижает стресс.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-scale transition-all hover:shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-start gap-3 text-xl">
                  <Icon name="Award" className="text-secondary mt-1 flex-shrink-0" size={24} />
                  <span>6. ХВАЛИТЕ ЗА УСПЕХИ</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">
                  Отметьте, что отеки уменьшились, появилось больше сил. Это лучшая мотивация!
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Card className="border-2 border-secondary/30 bg-gradient-to-br from-secondary/5 to-primary/5 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Icon name="TrendingUp" className="text-secondary" size={28} />
              ПРОГРЕСС ЗА НЕДЕЛЮ
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              История выполнения за последние 7 дней
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-end justify-between gap-2 h-48">
              {weekData.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="flex-1 w-full flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-primary to-secondary rounded-t-lg transition-all duration-500 hover:opacity-80 relative group"
                      style={{ height: `${day.percentage}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap">
                        {day.completed}/{day.total}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    {day.shortDate}
                  </div>
                  <div className="text-xs font-bold text-foreground">
                    {day.percentage}%
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-3xl font-bold text-primary">
                  {Math.round(averageCompletion)}%
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Средний показатель
                </div>
              </div>
              <div className="text-center p-4 bg-secondary/10 rounded-lg">
                <div className="text-3xl font-bold text-secondary">
                  {history.length}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Дней отслеживания
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Icon name="CheckSquare" className="text-primary" size={28} />
              ЕЖЕДНЕВНЫЙ ЧЕК-ЛИСТ
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Отмечайте каждый день для контроля состояния
            </p>
            <div className="mt-4 bg-white/50 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Выполнено: {completedCount} из {checklist.length}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {checklist.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  item.checked
                    ? 'bg-secondary/10 border-secondary/30'
                    : 'bg-card border-border hover:border-primary/30'
                }`}
              >
                <Checkbox
                  id={item.id}
                  checked={item.checked}
                  onCheckedChange={() => handleChecklistToggle(item.id)}
                  className="h-6 w-6"
                />
                <label
                  htmlFor={item.id}
                  className={`flex-1 text-base cursor-pointer transition-all ${
                    item.checked ? 'text-muted-foreground line-through' : 'text-foreground font-medium'
                  }`}
                >
                  {item.label}
                </label>
                {item.checked && (
                  <Icon name="CheckCircle" className="text-secondary animate-scale-in" size={24} />
                )}
              </div>
            ))}
            <button
              onClick={resetChecklist}
              className="w-full mt-4 py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="Save" size={20} />
              Сохранить результаты дня
            </button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-secondary/10 to-primary/10 border-2 border-secondary/30">
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-foreground flex items-center justify-center gap-3">
              <Icon name="Heart" className="text-secondary" size={28} />
              Ваша поддержка – 50% успеха в лечении!
            </p>
          </CardContent>
        </Card>

        <footer className="text-center text-muted-foreground text-sm py-4">
          <p>Консультируйтесь с врачом-эндокринологом для индивидуальных рекомендаций</p>
        </footer>
        </div>
      </div>
    </div>
  );
};

export default Index;