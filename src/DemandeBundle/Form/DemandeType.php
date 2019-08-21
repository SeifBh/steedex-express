<?php

namespace DemandeBundle\Form;

use DemandeBundle\Enum\DemandeEtatEnum;
use DemandeBundle\Enum\DemandeTypeEnum;
use Doctrine\DBAL\Types\BooleanType;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\DateType;
use Symfony\Component\Form\Extension\Core\Type\NumberType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use UserBundle\Entity\User;

class DemandeType extends AbstractType
{
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $role = $options['user'];
       // var_dump($role);
        if (in_array('ROLE_CLIENT',$role)) {
            $builder

                ->add('montant', NumberType::class,array(
                        'attr'=> array('class' => 'form-control','placeholder'=>"Montant en dinars"),

                        'label'=>false,
                        'required' =>true
                    )
                );
        }

        if (in_array('ROLE_ADMIN',$role)) {

            $builder

                ->add('montant', NumberType::class,array(
                        'attr'=> array('class' => 'form-control','placeholder'=>"Montant en dinars"),

                        'label'=>false,
                        'required' =>true
                    )
                )

                ->add('dateEmission', DateType::class,array(
                        'attr'=> array('class' => 'form-control'),

                        'label'=>false,
                        'required' =>false
                    )
                )

                ->add('etat', ChoiceType::class, array(
                    'required' => true,
                    'choices' => DemandeEtatEnum::getAvailableTypes(),
                    'attr'=> array('class' => 'form-control','placeholder'=>"Etat Demande"),
                    'label'=>false,

                    'choices_as_values' => true,
                    'choice_label' => function($choice) {
                        return DemandeEtatEnum::getTypeName($choice);
                    }
                ));

        }

        if (in_array('ROLE_LIVREUR',$role)) {

            $builder




                ->add('etat', ChoiceType::class, array(
                    'required' => true,
                    'choices' => DemandeEtatEnum::getAvailableTypes(),
                    'attr'=> array('class' => 'form-control','placeholder'=>"Etat Demande"),
                    'label'=>false,

                    'choices_as_values' => true,
                    'choice_label' => function($choice) {
                        return DemandeEtatEnum::getTypeName($choice);
                    }
                ));

        }





        $builder

            ->add('titre', TextType::class,array(
                    'attr'=> array('class' => 'form-control','placeholder'=>"Titre de la demande"),

                    'label'=>false,
                    'required' =>true
                )
            )


            ->add('nom_prenom_recept', TextType::class,array(
                    'attr'=> array('class' => 'form-control','placeholder'=>"Nom & Prenom"),

                    'label'=>false,
                    'required' =>true
                )
            )

            ->add('lieu', TextType::class,array(
                    'attr'=> array('class' => 'form-control','placeholder'=>"Lieu Destinataire"),

                    'label'=>false,
                    'required' =>true
                )
            )
            ->add('addresse_recept', TextType::class,array(
                    'attr'=> array('class' => 'form-control','placeholder'=>"Adresse Destinataire"),

                    'label'=>false,
                    'required' =>true
                )
            )



            ->add('telephone_recept', TextType::class,array(
                    'attr'=> array('class' => 'form-control','placeholder'=>"Telephone Destinataire"),

                    'label'=>false,
                    'required' =>true
                )
            )





            ->add('quantite', TextType::class,array(
                    'attr'=> array('class' => 'form-control','placeholder'=>"Quantite"),

                    'label'=>false,
                    'required' =>true
                )
            )



        ->add('fragile', CheckboxType::class, array(

            'label'    => 'Colis fragile ? ',
   'required' => false
))



            ->add('tailleColis', ChoiceType::class, [
                    'choices'  => [
                        'Grand' => null,
                        'Moyen' => true,
                        'Petit' => false,
                    ],
                'label'=>false,
                'required' =>true,
        'attr'=> array('class' => 'form-control','placeholder'=>"Taille Colis en cm")


            ])


            ->add('type', ChoiceType::class, array(
                'required' => true,
                'choices' => DemandeTypeEnum::getAvailableTypes(),
                'attr'=> array('class' => 'form-control','placeholder'=>"Type Demande"),
                'label'=>false,

                'choices_as_values' => true,
                'choice_label' => function($choice) {
                    return DemandeTypeEnum::getTypeName($choice);
                },
            ))





            ->add('note', TextareaType::class,array(
                    'attr'=> array('class' => 'form-control','placeholder'=>"Ecrire quelque chose a propos le client destinataire"),

                    'label'=>false,
                    'required' =>false
                )
            )
            ->add('descProd', TextareaType::class,array(
                    'attr'=> array('class' => 'form-control','placeholder'=>"Ecrire quelque chose a propos le produit du colis"),

                    'label'=>false,
                    'required' =>false
                )
            )






        ;
    }/**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'DemandeBundle\Entity\Demande',
            'user' => null

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
