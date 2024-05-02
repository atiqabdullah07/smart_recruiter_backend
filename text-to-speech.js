const say = require('say')
const questions = [
    "Briefly Introduce Yourself.",
    "What is mongo db?",
    "Tell me about your previous job experience."
]
for (let i=0;i<questions.length;i++){
    say.export(questions[i], 'Cellos', 1, 'question'+i+'.wav', (err) => {
        if (err) {
          return console.error(err)
        }
       
        console.log('Text has been saved to hal'+i+'.wav.')
      })
    }
