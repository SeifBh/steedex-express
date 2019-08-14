<?php

namespace ReclamationBundle\Form;

use ReclamationBundle\Enum\ReclamationEtatEnum;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ReclamationType extends AbstractType
{
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $role = $options['user'];
        // var_dump($role);

            $builder
                ->add('etat', ChoiceType::class, array(
                    'required' => true,
                    'choices' => ReclamationEtatEnum::getAvailableTypes(),
                    'attr'=> array('class' => 'form-control','placeholder'=>"Etat "),
                    'label'=>false,

                    'choices_as_values' => true,
                    'choice_label' => function($choice) {
                        return ReclamationEtatEnum::getTypeName($choice);
                    }
                ))









            ->add('sujet', TextType::class,array(
                    'attr'=> array('class' => 'form-control','placeholder'=>"Sujet"),

                    'label'=>false
                )
            )


            ->add('description', TextareaType::class,array(
                    'attr'=> array('class' => 'form-control','placeholder'=>"Reclamer quelque chose"),

                    'label'=>false
                )
            );



    }/**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'ReclamationBundle\Entity\Reclamation',
            'user' => null

        ));
    }

    /**
     * {@inheritdoc}
     */
    public function getBlockPrefix()
    {
        return 'reclamationbundle_reclamation';
    }


}
