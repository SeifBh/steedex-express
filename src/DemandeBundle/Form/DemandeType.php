<?php

namespace DemandeBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class DemandeType extends AbstractType
{
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('titre', TextType::class,array(
                    'attr'=> array('class' => 'form-control','placeholder'=>"Titre de la demande"),

                    'label'=>false
                )
            )

            ->add('nom_prenom_recept', TextType::class,array(
                    'attr'=> array('class' => 'form-control','placeholder'=>"Nom & Prenom"),

                    'label'=>false
                )
            )


            ->add('addresse_recept', TextType::class,array(
                    'attr'=> array('class' => 'form-control','placeholder'=>"Adresse Destinataire"),

                    'label'=>false
                )
            )

            ->add('telephone_recept', TextType::class,array(
                    'attr'=> array('class' => 'form-control','placeholder'=>"Telephone Destinataire"),

                    'label'=>false
                )
            )

            ->add('montant', TextType::class,array(
                    'attr'=> array('class' => 'form-control','placeholder'=>"Montant en dinars"),

                    'label'=>false
                )
            )

            ->add('note', TextareaType::class,array(
                    'attr'=> array('class' => 'form-control','placeholder'=>"Montant en dinars"),

                    'label'=>false
                )
            )


        ;
    }/**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'DemandeBundle\Entity\Demande'
        ));
    }

    /**
     * {@inheritdoc}
     */
    public function getBlockPrefix()
    {
        return 'demandebundle_demande';
    }


}
