window.APP_CONFIG = {
  supabaseUrl: 'https://hzejllwtsowkkawwxdqc.supabase.co/',
  supabaseAnonKey: 'sb_publishable_7VXAMk_joCrNFKSzJrnMJQ_8E7abVdi',
  quizmasterPassword: 'HAKUNAMATATA!',
  unlockRadiusMeters: 80,
  checkpoints: [
    {
      id: 1,
      name: 'Checkpoint 1',
      description: 'Where our science meets the outside - the entrance',
      lat: 38.755280,
      lng: -9.157573,
      questions: [
        { id: 'q1', text: 'Question 1?', type: 'text', correctAnswer: 'example' },
        { id: 'q2', text: 'Question 2?', type: 'text', correctAnswer: 'example' },
        { id: 'q3', text: 'Question 3?', type: 'text', correctAnswer: 'example' }
      ]
    },
    {
      id: 2,
      name: 'Checkpoint 2',
      description: 'Palacete Pires Mendes',
      imageUrl: 'data:image/jpeg;base64,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',
      lat: 38.7526220,
      lng: -9.151514,
      questions: [
        { id: 'q4', text: 'Question 4?', type: 'text', correctAnswer: 'example' },
        { id: 'q5', text: 'Question 5?', type: 'text', correctAnswer: 'example' },
        { id: 'q6', text: 'Question 6?', type: 'text', correctAnswer: 'example' }
      ]
    },
    {
      id: 3,
      name: 'Checkpoint 3',
      description: 'The Alvalade roundabout/ Entrecampos.',
      lat: 38.748640,
      lng: -9.148444,
      questions: [
        { id: 'q7', text: 'Question 7?', type: 'text', correctAnswer: 'example' },
        { id: 'q8', text: 'Question 8?', type: 'text', correctAnswer: 'example' },
        { id: 'q9', text: 'Question 9?', type: 'text', correctAnswer: 'example' }
      ]
    },
    {
      id: 4,
      name: 'Checkpoint 4',
      description: 'Palácio das Vianinhas.',
      lat: 38.744235,
      lng: -9.144962,
      questions: [
        { id: 'q10', text: 'Question 10?', type: 'text', correctAnswer: 'example' },
        { id: 'q11', text: 'Question 11?', type: 'text', correctAnswer: 'example' },
        { id: 'q12', text: 'Question 12?', type: 'text', correctAnswer: 'example' }
      ]
    },
    {
      id: 5,
      name: 'Checkpoint 5',
      description: 'Culturgest - cultural foundation for the arts.',
      lat: 38.739970,
      lng: -9.142523,
      questions: [
        { id: 'q13', text: 'Question 13?', type: 'text', correctAnswer: 'example' },
        { id: 'q14', text: 'Question 14?', type: 'text', correctAnswer: 'example' },
        { id: 'q15', text: 'Question 15?', type: 'text', correctAnswer: 'example' }
      ]
    },
    {
      id: 6,
      name: 'Checkpoint 6',
      description: 'Gula´s',
      lat: 38.737295,
      lng: -9.141942,
      questions: [
        { id: 'q16', text: 'Question 16?', type: 'text', correctAnswer: 'example' },
        { id: 'q17', text: 'Question 17?', type: 'text', correctAnswer: 'example' },
        { id: 'q18', text: 'Question 18?', type: 'text', correctAnswer: 'example' }
      ]
    }
  ]
};
