<?phpnamespace DemandeBundle\Form;use DemandeBundle\Enum\DemandeEtatEnum;use DemandeBundle\Enum\DemandeTypeEnum;use Doctrine\DBAL\Types\BooleanType;use Symfony\Bridge\Doctrine\Form\Type\EntityType;use Symfony\Component\Form\AbstractType;use Symfony\Component\Form\Extension\Core\Type\CheckboxType;use Symfony\Component\Form\Extension\Core\Type\ChoiceType;use Symfony\Component\Form\Extension\Core\Type\DateType;use Symfony\Component\Form\Extension\Core\Type\NumberType;use Symfony\Component\Form\Extension\Core\Type\TextareaType;use Symfony\Component\Form\Extension\Core\Type\TextType;use Symfony\Component\Form\FormBuilderInterface;use Symfony\Component\OptionsResolver\OptionsResolver;use UserBundle\Entity\User;use DemandeBundle\Enum\DemandeTypeDCEnum;class DemandeCoursierType extends AbstractType{    /**     * {@inheritdoc}     */    public function buildForm(FormBuilderInterface $builder, array $options)    {        $role = $options['user'];        if (in_array('ROLE_ADMIN',$role)) {            $builder                ->add('etat', ChoiceType::class, array(                    'required' => true,                    'choices' => DemandeEtatEnum::getAvailableTypes(),                    'attr'=> array('class' => 'form-control','placeholder'=>"Etat Demande"),                    'label'=>false,                    'choices_as_values' => true,                    'choice_label' => function($choice) {                        return DemandeEtatEnum::getTypeName($choice);                    }                ));        }        $builder            ->add('quoi', TextType::class,array(                'attr'=> array('class' => 'form-control','placeholder'=>"Quoi"),                'label'=>false,                'required' =>false            ))            ->add('nomPrenomRecept', TextType::class,array(                'attr'=> array('class' => 'form-control','placeholder'=>"Destinataire"),                'label'=>false,                'required' =>false            ))            ->add('quoi', TextType::class,array(                'attr'=> array('class' => 'form-control','placeholder'=>"Quoi?"),                'label'=>false,                'required' =>false            ))            ->add('addresseRecept', TextType::class,array(                'attr'=> array('class' => 'form-control','placeholder'=>"Lieu"),                'label'=>false,                'required' =>false            ))            ->add('typeDC', ChoiceType::class, array(                'required' => true,                'choices' => DemandeTypeDCEnum::getAvailableTypes(),                'attr'=> array('class' => 'form-control','placeholder'=>"Type Demande"),                'label'=>false,                'choices_as_values' => true,                'choice_label' => function($choice) {                    return DemandeTypeDCEnum::getTypeName($choice);                }            ));        ;    }/** * {@inheritdoc} */    public function configureOptions(OptionsResolver $resolver)    {        $resolver->setDefaults(array(            'data_class' => 'DemandeBundle\Entity\Demande',            'user' => null        ));    }    /**     * {@inheritdoc}     */    public function getBlockPrefix()    {        return 'demandebundle_demandeCoursier';    }}