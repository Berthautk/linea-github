
// =====================================================================
// DGCAST Form 4, first sequence: clean version of the paper set by Mr TABIT (same questions, errors corrected)
// =====================================================================
const climTab = (temp, rain) => new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [2266].concat(Array(12).fill(683)), borders: BOX,
  rows: [['Month', 'J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'], ['Temperature (°C)'].concat(temp), ['Rainfall (mm)'].concat(rain)].map((r, i) => new TableRow({ children: r.map((c, j) =>
    cell(P(i === 0 || j === 0 ? '**' + c + '**' : String(c), { align: j ? AlignmentType.CENTER : undefined, after: 0, size: 21 }), j ? 683 : 2266, { shade: i === 0 ? 'D9D9D9' : undefined })) })) });

const task0 = (n, t, nLines) => [P(`**Task ${n}:** ${t}`, { before: 120, after: 40, keepNext: true }), ...DOTS(nLines)];
const F4C = {
  file: 'DGCAST_F4_Geography_Seq1_2026-2027_VERSION_PROPRE.docx', title: 'Form Four Geography – First Sequence', cls: 'FORM FOUR', module: '1', full: true, duration: '1 hour',
  competence: 'Learners are able to explain the characteristics of biomes and to manage soils sustainably.',
  facilitators: ['Mr KAMDEM Emmanuel', 'Mr TABIT B. Ajong'],
  instructions: ['This paper has two sections, A and B. Answer ALL the questions in each section.', 'The marks are given in brackets at the end of each question.'],
  body: [
    Hc('SECTION A: VERIFICATION OF RESOURCES'),
    H('i) Verification of Knowledge: Multiple Choice Questions (10 × 0.5 = 5 marks)'),
    P('Draw a dark line across the letter of the correct answer. Example: if B is the correct answer, draw a dark line across B.', { italics: true, after: 80 }),
    mcq([
      ['Soil is formed by physical, chemical and biological processes and is mainly composed of:', ['Rocks and metals only', 'Mineral particles, organic matter, water and air', 'Sand and cement', 'Plastic and glass']],
      ['Soil erosion that is caused mainly by human activities and occurs at a very fast rate is called:', ['Normal geologic erosion', 'Accelerated soil erosion', 'Natural erosion', 'Wind erosion only']],
      ['Which soil conservation method involves cutting a slope into a series of flat steps for cultivation?', ['Contour ploughing', 'Terracing', 'Strip cultivation', 'Planting of windbreaks']],
      ['An ecosystem is best described as:', ['A group of only plants in an area', 'A natural area where living and non-living components interact', 'A man-made structure', 'A single organism']],
      ['Organisms that manufacture their own food by converting solar energy into carbohydrates are called:', ['Herbivores', 'Producers (autotrophs)', 'Decomposers', 'Carnivores']],
      ['On average, what percentage of energy is transferred from one trophic level to the next?', ['100 %', '50 %', '10 %', '90 %']],
      ['Which ONE of the following is a depositional feature produced in hot deserts?', ['Inselbergs', 'Barchans', 'Rock pedestals', 'Yardangs']],
      ['Identify a strategy that can be used to solve the problem of water scarcity in hot desert areas:', ['Construction of water reservoirs', 'Wearing long sleeves to prevent sunburn', 'Planting crops far from any source of water', 'Exploiting petroleum and natural gas from the soil']],
      ['The following are relief units of Cameroon EXCEPT:', ['Northern Lowlands', 'Western Highlands', 'Atlas Mountains', 'Coastal Lowlands']],
      ['Cameroon is located between latitudes:', ['5° N and 9° N', '2° N and 8° N', '2° N and 13° N', '0° N and 5° N']],
    ]),
    H('ii) Verification of Skills: Structural Type Question (8 marks)', { before: 200 }),
    P('Study **Table 1** below, which shows the climate data of a station X in Africa.', { after: 60 }),
    climTab([27, 30, 33, 33, 30, 27, 26, 26, 26, 27, 28, 27], [0, 0, 3, 26, 115, 150, 178, 220, 190, 55, 2, 0]),
    C('Table 1: Climate data of station X', { italics: true, size: 20, before: 30, after: 80 }),
    P('**(a)  (i)**  Calculate the annual range of temperature of station X. **(3 marks)**', { before: 80, after: 0 }), ...DOTS(3),
    P('**(ii)**  Name the wettest month. **(2 marks)**', { before: 80, after: 0 }), ...DOTS(1),
    P('**(b)**  Name the biome in which station X is located, and give **two** reasons for your answer. **(3 marks)**', { before: 80, after: 0 }), ...DOTS(3),
    Hc('SECTION B: VERIFICATION OF COMPETENCE (5 marks)'),
    P('Study the passage and answer the questions that follow.', { after: 60 }),
    situation('Mrs Nkwetecha is a poor widow who recently became a farmer after the loss of her husband. She noticed that, after two years of cultivation, her crop yields dropped, and her farm on a hill slope has lost a lot of soil carried away by wind and torrential rain.'),
    ...task0(1, 'What is the problem described in the passage that is faced by Mrs Nkwetecha?', 2),
    ...task0(2, 'State **two** causes of the problem identified in Task 1 above.', 2),
    ...task0(3, 'As a geographer, suggest **two** measures that can be used by Mrs Nkwetecha and other farmers to solve the problem identified in Task 1 above.', 2),
    P('**Presentation: 2 marks**', { before: 160, align: AlignmentType.RIGHT }),
  ],
};
(async () => { await build(F4C); })();
