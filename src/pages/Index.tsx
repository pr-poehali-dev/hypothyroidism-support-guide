import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

const Index = () => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: 'pill', label: 'Таблетка принята утром натощак', checked: false },
    { id: 'energy', label: 'Уровень энергии в норме', checked: false },
    { id: 'mood', label: 'Настроение стабильное', checked: false },
    { id: 'noSwelling', label: 'Нет новых отеков', checked: false },
    { id: 'normalTemp', label: 'Не жалуется на холод', checked: false },
  ]);

  const handleChecklistToggle = (id: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const resetChecklist = () => {
    setChecklist(prev => prev.map(item => ({ ...item, checked: false })));
  };

  const completedCount = checklist.filter(item => item.checked).length;
  const progress = (completedCount / checklist.length) * 100;

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
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
              className="w-full mt-4 py-3 px-4 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="RotateCcw" size={20} />
              Сбросить на новый день
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
  );
};

export default Index;
