import React from 'react';
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const faqData = [
  {
    question: "Comment fonctionne système de prédiction ?",
    answer: "Notre système utilise des algorithmes d'apprentissage automatique avancés pour analyser les données académiques et comportementales des étudiants afin de prédire leurs performances futures."
  },
  {
    question: "Est-ce que mes données sont sécurisées ?",
    answer: "Absolument. La sécurité et la confidentialité des données sont notre priorité absolue. Toutes les données sont cryptées et stockées de manière sécurisée."
  },
  {
    question: "Puis-je accéder à la plateforme sur mobile ?",
    answer: "Oui, notre plateforme est entièrement responsive et accessible sur tous les appareils, y compris les smartphones et les tablettes."
  },
  {
    question: "Comment puis-je m'inscrire ?",
    answer: "Pour vous inscrire, cliquez simplement sur le bouton 'Commencer' en haut de la page et suivez les instructions pour créer votre compte."
  }
];

const FAQ = () => {
  return (
    <Box
      sx={{
        py: 8,
        bgcolor: 'background.default',
      }}
      id="faq"
    >
      <Container maxWidth="md">
        <Typography
          variant="h2"
          align="center"
          gutterBottom
          sx={{ mb: 6 }}
        >
          Questions Fréquentes
        </Typography>
        
        {faqData.map((faq, index) => (
          <Accordion key={index} elevation={0} sx={{ mb: 2, '&:before': { display: 'none' }, border: '1px solid #e0e0e0', borderRadius: '8px !important', overflow: 'hidden' }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index}-content`}
              id={`panel${index}-header`}
            >
              <Typography variant="h6" component="h3" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                {faq.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>
    </Box>
  );
};

export default FAQ;
