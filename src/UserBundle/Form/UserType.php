<?php

namespace UserBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\RepeatedType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class UserType extends AbstractType
{
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('username', TextType::class,array(
                    'attr'=> array('class' => 'form-control','placeholder'=>"Username"),

                    'label'=>false,
                    'required'=>true
                )
            )
            ->add('nom', TextType::class,array(
                    'attr'=> array('class' => 'form-control','placeholder'=>"Nom"),

                    'label'=>false,
                    'label'=>false,
                    'required'=>true
                )
            )

            ->add('prenom', TextType::class,array(
                    'attr'=> array('class' => 'form-control','placeholder'=>"Prenom"),

                    'label'=>false,
                    'required'=>true
                )
            )

            ->add('idFiscale', TextType::class,array(
                    'attr'=> array('class' => 'form-control','placeholder'=>"Identifiant Fiscale"),

                    'label'=>false
                )
            )
            ->add('addresse', TextType::class,array(
                    'attr'=> array('class' => 'form-control','placeholder'=>"Adresse"),

                    'label'=>false,
                    'required'=>true
                )
            )
            ->add('tel', TextType::class,array(
                    'attr'=> array('class' => 'form-control','placeholder'=>"Telephone"),

                    'label'=>false,
                    'required'=>true
                )
            )

            ->add('fraiLiv', TextType::class,array(
                    'attr'=> array('class' => 'form-control','placeholder'=>"Frais de livraison"),

                    'label'=>false,
                    'required'=>true
                )
            )

            ->add('email', EmailType::class,array(
                    'attr'=> array('class' => 'form-control','placeholder'=>"Email"),

                    'label'=>false,
                    'required'=>false
                )
            )

            ->add('notes', TextareaType::class,array(
                    'attr'=> array('class' => 'form-control','placeholder'=>"Notes"),

                    'label'=>false,
                    'required'=>false
                )
            )



            ->add('plainPassword', RepeatedType::class, array(
                'label'=>false,
                'type' => PasswordType::class,
                'required'=>true,
                'options' => array(
                    'translation_domain' => 'FOSUserBundle',
                    'attr' => array(
                        'class'=>'form-control',
                        'placeholder'=>"Password",
                        'autocomplete' => 'new-password',
                    ),
                ),
                'first_options' => array('label' => 'form.password'),
                'second_options' => array('label' => 'form.password_confirmation'),
                'invalid_message' => 'fos_user.password.mismatch',
            ))
            ->add('roles', ChoiceType::class, array(
                'attr'  =>  array('class' => 'form-control',
                    'style' => 'margin:5px 0;'),
                'choices' =>
                    array
                    (
                        'ROLE_PERSONNEL' => 'ROLE_PERSONNEL',
                        'ROLE_CLIENT' => 'ROLE_CLIENT',
                        'ROLE_LIVREUR' => 'ROLE_LIVREUR',
                        'ROLE_ADMIN' => 'ROLE_ADMIN',
                        'ROLE_SUPER_ADMIN' => 'ROLE_SUPER_ADMIN',
                        'ROLE_USER' => 'ROLE_USER'
                    ) ,
                'multiple' => true,
                'required' => true,
            ))
        ;
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'UserBundle\Entity\User'
        ));
    }

    /**
     * {@inheritdoc}
     */
    public function getBlockPrefix()
    {
        return 'userbundle_user';
    }


}
