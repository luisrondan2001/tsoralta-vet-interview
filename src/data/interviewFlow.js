export const conversationTree = {
  welcome: {
    id: 'welcome',
    speaker: 'assistant',
    text: "👨‍⚕️ ¡Doc! Gracias por tomarse unos minutos. Estamos conversando con veterinarios de campo en la sierra para entender mejor su día a día. No hay respuestas correctas ni incorrectas, solo queremos aprender de su experiencia. ¿Le parece si empezamos?",
    options: [
      { text: "Claro, adelante", next: "intro_name" }
    ]
  },
  intro_name: {
    id: 'intro_name',
    speaker: 'assistant',
    text: "Primero, ¿cómo le gusta que le llamen? (Opcional)",
    inputType: 'text',
    placeholder: "Ej: Doc Juan, Dra. María...",
    next: "q_zone",
    saveAs: 'vetName'
  },
  q_zone: {
    id: 'q_zone',
    speaker: 'assistant',
    text: "¿En qué zona trabaja principalmente? (Ej: provincia, distrito)",
    inputType: 'text',
    placeholder: "Ej: Canchis, Anta, Quispicanchi...",
    next: "q_routine",
    saveAs: 'zone'
  },
  q_routine: {
    id: 'q_routine',
    speaker: 'assistant',
    text: "Cuénteme un poco, Doc: ¿cómo es un día típico para usted? Desde que sale de casa hasta que regresa.",
    tip: "Dejar que describa libremente. Identificar si menciona papeleo, registros, reportes.",
    options: [
      { text: "Describe visitas a ganaderos, atención clínica, etc.", next: "q_routine_follow" }
    ]
  },
  q_routine_follow: {
    id: 'q_routine_follow',
    speaker: 'assistant',
    text: "¿Y después de atender a los animales, hay algo más que tenga que hacer? ¿Anotar en algún lado, avisar a alguien, preparar algo para el ganadero?",
    options: [
      { text: "Sí, siempre anoto en mi cuaderno/libreta", next: "q_pain_detail", signal: "positive" },
      { text: "A veces hago un certificado de vacunación", next: "q_cert_demand", signal: "positive" },
      { text: "Mando un reporte por WhatsApp al dueño", next: "q_whatsapp_usage", signal: "neutral" },
      { text: "No, con la visita ya está, nada más", next: "q_no_admin", signal: "negative" }
    ]
  },
  q_no_admin: {
    id: 'q_no_admin',
    speaker: 'assistant',
    text: "Entiendo. Y cuando hay campañas de SENASA o el municipio pide algún informe, ¿cómo se las arregla?",
    options: [
      { text: "Ahí sí tengo que preparar un informe", next: "q_pain_detail", signal: "neutral" },
      { text: "Nunca me han pedido nada", next: "q_clients", signal: "negative" }
    ]
  },
  q_pain_detail: {
    id: 'q_pain_detail',
    speaker: 'assistant',
    text: "Cuando tiene que hacer esos registros o informes, ¿cuánto tiempo le toma más o menos?",
    options: [
      { text: "Menos de 15 minutos", next: "q_clients", signal: "negative" },
      { text: "Entre 15 y 30 minutos", next: "q_clients", signal: "neutral" },
      { text: "Más de media hora, a veces una hora", next: "q_clients", signal: "positive" },
      { text: "Depende, pero me quita tiempo de descanso", next: "q_clients", signal: "positive" }
    ]
  },
  q_whatsapp_usage: {
    id: 'q_whatsapp_usage',
    speaker: 'assistant',
    text: "Ah, usa WhatsApp. ¿Y le funciona bien? ¿No se le pierden los mensajes o las fotos de recetas?",
    options: [
      { text: "A veces se me llena la memoria y tengo que borrar", next: "q_clients", signal: "positive" },
      { text: "No, todo bien, lo manejo sin problema", next: "q_clients", signal: "neutral" }
    ]
  },
  q_clients: {
    id: 'q_clients',
    speaker: 'assistant',
    text: "Cambiando de tema, Doc. ¿A cuántos ganaderos atiende en una semana normal? ¿Son siempre los mismos o van rotando?",
    options: [
      { text: "Tengo mis clientes fijos, unos 10-20", next: "q_client_relation", signal: "positive" },
      { text: "Varía mucho, a veces 5, a veces 30", next: "q_client_acquisition", signal: "neutral" },
      { text: "Trabajo para una institución/municipio", next: "q_institutional", signal: "neutral" }
    ]
  },
  q_client_relation: {
    id: 'q_client_relation',
    speaker: 'assistant',
    text: "Qué bien. Y esos ganaderos fijos, ¿cada cuánto lo llaman?",
    options: [
      { text: "Casi todas las semanas", next: "q_cert_demand", signal: "positive" },
      { text: "Una vez al mes más o menos", next: "q_cert_demand", signal: "positive" },
      { text: "Solo cuando hay emergencia", next: "q_cert_demand", signal: "neutral" }
    ]
  },
  q_client_acquisition: {
    id: 'q_client_acquisition',
    speaker: 'assistant',
    text: "¿Y cómo llegan esos clientes nuevos? ¿Lo contactan directamente o usted sale a buscarlos?",
    options: [
      { text: "Me recomiendan entre ellos", next: "q_cert_demand", signal: "positive" },
      { text: "Por campañas del municipio/SENASA", next: "q_cert_demand", signal: "neutral" },
      { text: "Tengo que ir a ofrecer mis servicios", next: "q_cert_demand", signal: "negative" }
    ]
  },
  q_institutional: {
    id: 'q_institutional',
    speaker: 'assistant',
    text: "Entiendo. Y además del trabajo institucional, ¿atiende ganaderos por su cuenta?",
    options: [
      { text: "Sí, también tengo mis clientes particulares", next: "q_client_relation", signal: "positive" },
      { text: "No, solo lo institucional", next: "q_cert_demand", signal: "negative" }
    ]
  },
  q_cert_demand: {
    id: 'q_cert_demand',
    speaker: 'assistant',
    text: "Doc, una consulta. La última vez que un ganadero le pidió un certificado de vacunación o algo para vender un animal, ¿cómo lo hizo? Cuénteme el paso a paso.",
    tip: "Clave: si describe un proceso manual engorroso, hay dolor.",
    options: [
      { text: "Lo escribo a mano en un formato que tengo", next: "q_cert_time", signal: "positive" },
      { text: "Lo hago en la computadora y lo imprimo", next: "q_cert_time", signal: "neutral" },
      { text: "Nunca me han pedido", next: "q_senasa", signal: "negative" }
    ]
  },
  q_cert_time: {
    id: 'q_cert_time',
    speaker: 'assistant',
    text: "¿Y ese proceso le toma mucho tiempo?",
    options: [
      { text: "Sí, es tedioso, tengo que buscar datos", next: "q_cert_frequency", signal: "positive" },
      { text: "No, es rápido", next: "q_cert_frequency", signal: "neutral" }
    ]
  },
  q_cert_frequency: {
    id: 'q_cert_frequency',
    speaker: 'assistant',
    text: "¿Con qué frecuencia le piden ese tipo de documentos?",
    options: [
      { text: "Todas las semanas", next: "q_cert_value", signal: "positive" },
      { text: "Una o dos veces al mes", next: "q_cert_value", signal: "positive" },
      { text: "Muy de vez en cuando", next: "q_cert_value", signal: "neutral" }
    ]
  },
  q_cert_value: {
    id: 'q_cert_value',
    speaker: 'assistant',
    text: "Y el ganadero, ¿le paga algo extra por ese certificado o va incluido en la consulta?",
    options: [
      { text: "Sí, cobro aparte", next: "q_senasa", signal: "positive" },
      { text: "No, es parte del servicio", next: "q_senasa", signal: "neutral" }
    ]
  },
  q_senasa: {
    id: 'q_senasa',
    speaker: 'assistant',
    text: "Hablando de las autoridades, ¿SENASA o el municipio le piden a usted algún tipo de reporte de los animales que atiende?",
    options: [
      { text: "Sí, todos los meses", next: "q_senasa_process", signal: "positive" },
      { text: "Solo cuando hay campañas", next: "q_senasa_process", signal: "neutral" },
      { text: "Nunca", next: "q_tools", signal: "negative" }
    ]
  },
  q_senasa_process: {
    id: 'q_senasa_process',
    speaker: 'assistant',
    text: "¿Y cómo hace para entregar esa información? ¿Le resulta complicado?",
    options: [
      { text: "Lleno planillas a mano y las llevo", next: "q_tools", signal: "positive" },
      { text: "Las envío por correo o WhatsApp", next: "q_tools", signal: "neutral" },
      { text: "Es fácil, solo firmo algo", next: "q_tools", signal: "negative" }
    ]
  },
  q_tools: {
    id: 'q_tools',
    speaker: 'assistant',
    text: "Ya casi terminamos, Doc. Pensando en todo lo que usa para su trabajo: cuadernos, lapiceros, recargas, gasolina, etc. ¿Más o menos cuánto gasta al mes en esas cosas?",
    options: [
      { text: "Menos de 50 soles", next: "q_digital", signal: "negative" },
      { text: "Entre 50 y 150 soles", next: "q_digital", signal: "neutral" },
      { text: "Más de 150 soles", next: "q_digital", signal: "positive" }
    ]
  },
  q_digital: {
    id: 'q_digital',
    speaker: 'assistant',
    text: "¿Y ha usado alguna vez una aplicación en el celular para su trabajo? No necesariamente para animales, cualquier cosa que le ayude.",
    options: [
      { text: "Sí, uso apps para notas, mapas, etc.", next: "q_paid_apps", signal: "positive" },
      { text: "Solo WhatsApp", next: "q_willingness", signal: "neutral" },
      { text: "No, solo llamadas", next: "q_willingness", signal: "negative" }
    ]
  },
  q_paid_apps: {
    id: 'q_paid_apps',
    speaker: 'assistant',
    text: "¿Y alguna vez pagó por alguna de esas aplicaciones?",
    options: [
      { text: "Sí, pagué por una app", next: "q_paid_detail", signal: "positive" },
      { text: "No, solo uso las gratis", next: "q_willingness", signal: "neutral" }
    ]
  },
  q_paid_detail: {
    id: 'q_paid_detail',
    speaker: 'assistant',
    text: "¡Qué interesante! ¿Se acuerda cuánto pagaba y para qué era?",
    inputType: 'text',
    placeholder: "Ej: 20 soles/mes para...",
    next: "q_willingness",
    saveAs: 'paidAppDetail'
  },
  q_willingness: {
    id: 'q_willingness',
    speaker: 'assistant',
    text: "Última pregunta, Doc. Si existiera algo que le ahorrara todo el tiempo que gasta en papeleo, certificados y reportes… ¿cuánto cree que valdría eso para usted al mes? (Puede decir un número o 'nada')",
    inputType: 'text',
    placeholder: "Ej: 50 soles, 100 soles, nada...",
    next: "q_closing",
    saveAs: 'willingnessAmount'
  },
  q_closing: {
    id: 'q_closing',
    speaker: 'assistant',
    text: "Doc, de todo lo que hemos conversado, ¿qué es lo que más le quita el sueño o le complica la vida en su trabajo?",
    options: [
      { text: "El papeleo / certificados / reportes", next: "q_referral", signal: "positive" },
      { text: "El transporte / distancias / gasolina", next: "q_referral", signal: "negative" },
      { text: "Los cobros / la informalidad", next: "q_referral", signal: "negative" },
      { text: "La falta de medicamentos / insumos", next: "q_referral", signal: "neutral" }
    ]
  },
  q_referral: {
    id: 'q_referral',
    speaker: 'assistant',
    text: "Muchas gracias por su tiempo, Doc. ¿Conoce a algún colega que trabaje en otra zona y que también pueda compartir su experiencia? Nos ayudaría un montón.",
    options: [
      { text: "Sí, le paso el contacto", next: "end_positive", signal: "positive" },
      { text: "Déjeme pensarlo", next: "end_neutral", signal: "neutral" },
      { text: "No, lo siento", next: "end_neutral", signal: "negative" }
    ]
  },
  end_positive: {
    id: 'end_positive',
    speaker: 'assistant',
    text: "¡Excelente! Le agradecemos muchísimo. Si le interesa, podemos enviarle un resumen de lo que estamos armando para ayudar a veterinarios como usted. ¿Quiere dejar su WhatsApp?",
    inputType: 'text',
    placeholder: "WhatsApp (opcional)",
    next: "final",
    saveAs: 'contactWhatsApp'
  },
  end_neutral: {
    id: 'end_neutral',
    speaker: 'assistant',
    text: "No hay problema, Doc. Le agradecemos enormemente su tiempo. Si más adelante quiere saber más de este proyecto, puede dejar su contacto.",
    inputType: 'text',
    placeholder: "WhatsApp o correo (opcional)",
    next: "final",
    saveAs: 'contact'
  },
  final: {
    id: 'final',
    speaker: 'assistant',
    text: "¡Listo! Hemos terminado. Muchas gracias por compartir su experiencia. Que tenga un excelente día.",
    isEnd: true
  }
};

export const SIGNAL_CONFIG = {
  positive: { color: '#2e7d32', bg: '#e8f5e9', label: 'Positiva' },
  neutral:  { color: '#b45f2b', bg: '#fff3e0', label: 'Neutra' },
  negative: { color: '#c62828', bg: '#ffebee', label: 'Negativa' }
};