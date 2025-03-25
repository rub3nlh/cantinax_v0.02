import React, { useState } from 'react';
import { ChevronDown, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

const faqs: FAQItem[] = [
  {
    question: '¿Cómo funciona el servicio?',
    answer: (
      <div className="space-y-4">
        <p>¡Más fácil que preparar un café cubano! Solo sigue tres pasos:</p>
        <ol className="list-decimal list-inside space-y-2">
          <li><strong>Elige tu paquete</strong>: Selecciona entre 3, 5 ó 7 días de comida.</li>
          <li><strong>Personaliza el menú</strong>: Combina las comidas disponibles según los gustos de tu familiar.</li>
          <li><strong>Indica la dirección</strong>: Dinos dónde entregarlo y ¡listo!</li>
        </ol>
        <p>
          La <strong>primera entrega</strong> llegará a la puerta de tu hogar en <strong>menos de 3 horas</strong> después de confirmar tu pedido. 
          Luego, recibirás entregas cada <strong>48 horas</strong>, con <strong>2 días de comida fresca</strong> por paquete. 
          ¡Así garantizamos que siempre disfruten de platos recién hechos!
        </p>
      </div>
    )
  },
  {
    question: '¿Cada cuánto tiempo recibo una entrega?',
    answer: (
      <div className="space-y-4">
        <p>
          Tu primera entrega será <em>ultrarrápida</em>: <strong>en menos de 3 horas</strong> tras confirmar el pedido. 
          Las siguientes llegaran cada <strong>48 horas</strong>, respetando siempre el ritmo de tu paquete.
        </p>
        <p>Por ejemplo:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Paquete de 3 comidas: 2 entregas (ej. Si pediste un lunes. Lunes: 2 comidas / miércoles: 1 comida).</li>
          <li>Paquete de 7 comidas: 4 entregas (ej. Si pediste un lunes. Lunes: 2 comidas / miércoles: 2 comida / viernes: 2 comidas / domingo: 1 comida).</li>
        </ul>
        <p>¡Nunca te quedarás sin comida en la mesa!</p>
      </div>
    )
  },
  {
    question: '¿Qué zonas cubren actualmente?',
    answer: (
      <div className="space-y-4">
        <p>
          Hoy estamos entregando sonrisas (y comida caliente) en <strong>toda La Habana y zonas aledañas</strong>. 
          ¡Pronto llegaremos a más provincias!
        </p>
        <p>
          Si no estás en la zona, déjanos tu correo y serás el primero en saber cuando expandamos.
        </p>
      </div>
    )
  },
  {
    question: '¿Cuánto cuesta la entrega?',
    answer: (
      <div className="space-y-4">
        <p>
          ¡La mejor noticia! El costo de <strong>todas las entregas está incluido en el precio del paquete</strong>.
        </p>
        <p>
          No importa si vives en Miramar o Guanabacoa: si estás en nuestra zona de cobertura, <em>no pagarás un peso extra</em>. 
          ¡Nosotros nos encargamos de todo!
        </p>
      </div>
    )
  },
  {
    question: '¿Qué tipo de comidas ofrecen?',
    answer: (
      <div className="space-y-4">
        <p>
          Platos que saben a familia, tradición y Cuba. Servimos <strong>comidas caseras y abundantes</strong>, 
          preparadas con ingredientes frescos y el mismo cariño que tu abuela pondría.
        </p>
        <p>
          Desde arroz moro hasta bistec encebollado, cada bocado es un homenaje a nuestra cocina.
        </p>
      </div>
    )
  },
  {
    question: '¿Cómo garantizan la calidad y seguridad de las comidas?',
    answer: (
      <div className="space-y-4">
        <p>Tu seguridad es sagrada para nosotros. Por eso:</p>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span><strong>Sanitización rigurosa</strong>: Cocinas certificadas y personal entrenado en normas de higiene.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span><strong>Empaque sellado al vacío</strong>: Cada comida viaja en recipientes herméticos para mantener su frescura.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span><strong>Cadena de frío controlada</strong>: Transportamos los alimentos en vehículos refrigerados.</span>
          </li>
        </ul>
        <p><em>Desde la cocina hasta tu mesa, cuidamos cada detalle.</em></p>
      </div>
    )
  },
  {
    question: '¿Cómo recomendamos consumir las comidas de cada entrega?',
    answer: (
      <div className="space-y-4">
        <p>Te sugerimos:</p>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <span>🍽️</span>
            <span><strong>Día 1</strong>: Disfruta una comida recién entregada.</span>
          </li>
          <li className="flex items-start gap-2">
            <span>❄️</span>
            <span><strong>Día 2</strong>: Guarda la segunda comida <em>sin abrir</em> en la nevera.</span>
          </li>
          <li className="flex items-start gap-2">
            <span>⏲️</span>
            <span><strong>Al servir</strong>: Calienta en microondas 2-3 minutos y ¡listo!</span>
          </li>
        </ul>
        <p className="text-yellow-700 bg-yellow-50 p-4 rounded-lg flex items-start gap-2">
          <span>⚠️</span>
          <span><em>No recomendamos guardar las comidas más de 48 horas para preservar su sabor y calidad.</em></span>
        </p>
      </div>
    )
  },
  {
    question: '¿Puedo armar mi propio paquete de comidas?',
    answer: (
      <div className="space-y-4">
        <p>
          ¡Claro que sí! En nuestra app, <strong>tú eres el chef</strong>. Mezcla platos como prefieras: 
          ¿Arroz amarillo con pollo los lunes y pescado frito los viernes? ¿Bistec de cerdo todos los días? ¡Hazlo posible!
        </p>
        <p>
          Personaliza cada paquete para que tu familiar reciba exactamente lo que le gusta.
        </p>
      </div>
    )
  },
  {
    question: '¿Qué métodos de pago aceptan?',
    answer: (
      <div className="space-y-4">
        <p>Paga como más te convenga:</p>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <span>💳</span>
            <span><strong>Tarjetas de crédito/débito</strong> (Visa, Mastercard).</span>
          </li>
          <li className="flex items-start gap-2">
            <span>📲</span>
            <span><strong>Saldo Tropipay</strong>: Rápido y seguro.</span>
          </li>
        </ul>
        <p className="text-sm text-gray-600 italic">
          Todas las transacciones están protegidas con encriptación de última generación.
        </p>
      </div>
    )
  }
];

export const FAQ: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Preguntas Frecuentes</h2>
            <p className="text-xl text-gray-600">
              Tu tranquilidad es nuestra prioridad. Aquí resolvemos todas tus dudas.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-medium pr-8">{faq.question}</h3>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      openItems.includes(index) ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {openItems.includes(index) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-6 pb-4">{faq.answer}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-lg mb-4">¿Tienes más preguntas?</p>
            <div className="flex items-center justify-center gap-2">
              <Mail className="w-5 h-5 text-red-500" />
              <a
                href="mailto:soporte@lacantinaxl.com"
                className="text-red-500 hover:text-red-600 font-medium"
              >
                soporte@lacantinaxl.com
              </a>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              ¡Estamos aquí para servirte como a un hijo de la casa! ❤️
            </p>
          </div>

          <div className="mt-12 text-center text-sm text-gray-500 italic border-t border-gray-200 pt-8">
            En La Cantina XL, cada plato es una promesa de calidad, tradición y amor.
          </div>
        </div>
      </div>
    </section>
  );
};